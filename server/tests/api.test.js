import { test, before, after, describe } from 'node:test';
import assert from 'node:assert/strict';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';

let mongo;
let app;
let models;
let disconnectDb;
const emails = [];

before(async () => {
  mongo = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongo.getUri();
  process.env.JWT_SECRET = 'test-secret-that-is-definitely-longer-than-32-chars';
  process.env.APP_URL = 'http://localhost:5173';
  // Capture outgoing emails (no RESEND_API_KEY in tests, so they are logged).
  const info = console.info;
  console.info = (msg, ...rest) => (String(msg).startsWith('[email:not-sent]') ? emails.push(String(msg)) : info(msg, ...rest));
  ({ default: app } = await import('../app.js'));
  models = await import('../models/index.js');
  ({ disconnectDb } = await import('../db.js'));
});

after(async () => {
  await disconnectDb();
  await mongo.stop();
});

const XHR = { 'X-Requested-With': 'XMLHttpRequest' };
const agent = () => request.agent(app);
const signup = (a, overrides = {}) => a.post('/api/auth/signup').set(XHR).send({ firstName: 'Ada', lastName: 'Mover', email: 'ada@example.com', password: 'correct horse', ...overrides });

const quoteBody = (overrides = {}) => ({
  firstName: 'Ada', lastName: 'Mover', email: 'quote@example.com', phone: '306 555 0123', contactMethod: 'email',
  origin: { city: 'Saskatoon', province: 'SK' }, destination: { city: 'Calgary', province: 'AB' },
  moveDate: '2030-06-01', moveType: 'long_distance', services: ['packing_unpacking'], ...overrides,
});

describe('platform', () => {
  test('health check and JSON 404 for unknown API routes', async () => {
    assert.deepEqual((await request(app).get('/api/health')).body, { ok: true });
    const res = await request(app).get('/api/nope');
    assert.equal(res.status, 404);
    assert.equal(res.body.error.message, 'Not found.');
  });

  test('state-changing requests without the AJAX header are blocked (CSRF)', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'a@b.co', password: 'x' });
    assert.equal(res.status, 403);
  });

  test('validation errors come back per field', async () => {
    const res = await request(app).post('/api/auth/signup').set(XHR).send({ firstName: '', lastName: 'X', email: 'nope', password: 'short' });
    assert.equal(res.status, 400);
    assert.ok(res.body.error.fields.firstName);
    assert.ok(res.body.error.fields.email);
    assert.ok(res.body.error.fields.password);
  });
});

describe('accounts', () => {
  test('sign up starts a session and hides the password hash', async () => {
    const a = agent();
    const res = await signup(a);
    assert.equal(res.status, 201);
    assert.equal(res.body.user.email, 'ada@example.com');
    assert.equal(res.body.user.passwordHash, undefined);
    assert.match(res.headers['set-cookie'][0], /rmc_session=.*HttpOnly/i);
    const session = await a.get('/api/auth/session');
    assert.equal(session.body.user.firstName, 'Ada');
  });

  test('duplicate email is rejected on the email field', async () => {
    const res = await signup(agent());
    assert.equal(res.status, 409);
    assert.ok(res.body.error.fields.email);
  });

  test('login, wrong password, logout', async () => {
    const a = agent();
    assert.equal((await a.post('/api/auth/login').set(XHR).send({ email: 'ada@example.com', password: 'wrong pass' })).status, 401);
    assert.equal((await a.post('/api/auth/login').set(XHR).send({ email: 'nobody@example.com', password: 'whatever1' })).status, 401);
    const ok = await a.post('/api/auth/login').set(XHR).send({ email: 'ADA@example.com', password: 'correct horse', remember: true });
    assert.equal(ok.status, 200);
    assert.match(ok.headers['set-cookie'][0], /Max-Age=2592000/);
    assert.equal((await a.post('/api/auth/logout').set(XHR)).status, 204);
    assert.equal((await a.get('/api/auth/session')).body.user, null);
  });

  test('account locks after repeated failed logins', async () => {
    await signup(agent(), { email: 'lock@example.com' });
    for (let i = 0; i < 5; i++) await request(app).post('/api/auth/login').set(XHR).send({ email: 'lock@example.com', password: 'bad password' });
    const res = await request(app).post('/api/auth/login').set(XHR).send({ email: 'lock@example.com', password: 'correct horse' });
    assert.equal(res.status, 429);
  });

  test('password reset: email link, one-time token, old sessions signed out', async () => {
    const old = agent();
    await signup(old, { email: 'reset@example.com' });
    emails.length = 0;
    assert.equal((await request(app).post('/api/auth/forgot-password').set(XHR).send({ email: 'reset@example.com' })).status, 200);
    assert.equal((await request(app).post('/api/auth/forgot-password').set(XHR).send({ email: 'unknown@example.com' })).status, 200);
    assert.equal(emails.length, 1, 'only the real account gets an email');
    const token = decodeURIComponent(emails[0].match(/token=([^\s]+)/)[1]);
    await new Promise((r) => setTimeout(r, 1100)); // reset must be later than the old session
    assert.equal((await request(app).post('/api/auth/reset-password').set(XHR).send({ token, password: 'brand new pass' })).status, 200);
    assert.equal((await request(app).post('/api/auth/reset-password').set(XHR).send({ token, password: 'another pass' })).status, 400, 'token is single use');
    assert.equal((await old.get('/api/auth/session')).body.user, null, 'old session no longer valid');
    assert.equal((await request(app).post('/api/auth/login').set(XHR).send({ email: 'reset@example.com', password: 'brand new pass' })).status, 200);
  });
});

describe('quote requests', () => {
  test('saved with a reference, and linked when the customer signs up', async () => {
    const res = await request(app).post('/api/public/quotes').set(XHR).send(quoteBody());
    assert.equal(res.status, 201);
    assert.match(res.body.reference, /^QR-[A-Z0-9]{6}$/);
    const a = agent();
    await signup(a, { email: 'quote@example.com' });
    const moves = await a.get('/api/portal/moves');
    assert.equal(moves.body.moves.length, 1);
    assert.equal(moves.body.moves[0].status, 'Draft');
    assert.equal(moves.body.moves[0].origin.city, 'Saskatoon');
  });

  test('invalid requests are rejected with field errors', async () => {
    const res = await request(app).post('/api/public/quotes').set(XHR).send(quoteBody({ email: 'bad', moveDate: '' }));
    assert.equal(res.status, 400);
    assert.ok(res.body.error.fields.email);
    assert.ok(res.body.error.fields.moveDate);
  });

  test('instant estimate reports unavailable until pricing is configured', async () => {
    assert.equal((await request(app).post('/api/public/estimate').set(XHR).send({})).status, 503);
  });
});

describe('customer portal', () => {
  test('requires sign-in', async () => {
    assert.equal((await request(app).get('/api/portal/overview')).status, 401);
  });

  test('shows only the customer’s own records; quotes can be accepted once', async () => {
    const a = agent();
    const { body } = await signup(a, { email: 'portal@example.com' });
    const user = await models.User.findOne({ email: body.user.email });
    const other = await models.User.findOne({ email: 'ada@example.com' });
    await models.Quote.create({ reference: 'Q-MINE01', userId: user._id, totalCents: 150000, status: 'Ready', services: ['Packing'] });
    await models.Quote.create({ reference: 'Q-THEIRS', userId: other._id, totalCents: 99900, status: 'Ready' });
    await models.Conversation.create({ reference: 'MSG-TEST01', userId: user._id, subject: 'Move details', messages: [{ from: 'team', body: 'Hello!' }] });

    const quotes = (await a.get('/api/portal/quotes')).body.quotes;
    assert.equal(quotes.length, 1);
    assert.equal(quotes[0].id, 'Q-MINE01');
    assert.equal(quotes[0].total, 1500);
    assert.equal(quotes[0].userId, undefined);

    assert.equal((await a.post('/api/portal/quotes/Q-THEIRS/accept').set(XHR)).status, 404, 'cannot touch another customer’s quote');
    assert.equal((await a.post('/api/portal/quotes/Q-MINE01/accept').set(XHR)).status, 200);
    assert.equal((await a.post('/api/portal/quotes/Q-MINE01/accept').set(XHR)).status, 409);

    const sent = await a.post('/api/portal/messages/MSG-TEST01').set(XHR).send({ body: 'Thanks!' });
    assert.equal(sent.status, 201);
    assert.equal(sent.body.conversation.messages.length, 2);

    const overview = (await a.get('/api/portal/overview')).body;
    assert.equal(overview.summary.quoteStatus, 'Accepted');
    assert.ok(overview.activity.some((x) => x.title === 'Quote accepted'));
  });

  test('profile and notification settings can be updated', async () => {
    const a = agent();
    await signup(a, { email: 'profile@example.com' });
    const res = await a.put('/api/portal/profile').set(XHR).send({ firstName: 'Ada', lastName: 'Lovelace', email: 'profile@example.com', phone: '306 555 0199', city: 'Regina', province: 'SK' });
    assert.equal(res.status, 200);
    assert.equal((await a.get('/api/portal/profile')).body.profile.city, 'Regina');
    const dup = await a.put('/api/portal/profile').set(XHR).send({ firstName: 'Ada', lastName: 'L', email: 'ada@example.com' });
    assert.equal(dup.status, 409);
    const s = await a.put('/api/portal/settings').set(XHR).send({ notifications: { moveUpdates: false, quoteUpdates: true, paymentUpdates: true, documentUpdates: true } });
    assert.equal(s.body.notifications.moveUpdates, false);
  });

  test('payments and uploads report unavailable until providers are set up', async () => {
    const a = agent();
    await a.post('/api/auth/login').set(XHR).send({ email: 'profile@example.com', password: 'correct horse' });
    assert.equal((await a.post('/api/portal/payments').set(XHR).send({})).status, 503);
    assert.equal((await a.post('/api/portal/documents').set(XHR).send({})).status, 503);
  });
});

describe('reviews', () => {
  test('submitted reviews stay private until published', async () => {
    assert.equal((await request(app).post('/api/public/reviews').set(XHR).send({ name: 'Sam Lee', email: 'sam@example.com', rating: 5, body: 'Great crew, careful with everything we owned.' })).status, 201);
    assert.equal((await request(app).get('/api/public/reviews')).body.reviews.length, 0);
    await models.Review.updateOne({ email: 'sam@example.com' }, { status: 'published', publishedAt: new Date() });
    const res = await request(app).get('/api/public/reviews');
    assert.equal(res.body.reviews.length, 1);
    assert.equal(res.body.reviews[0].displayName, 'Sam L.');
    assert.equal(res.body.reviews[0].email, undefined);
    assert.equal(res.body.summary.average, 5);
  });
});
