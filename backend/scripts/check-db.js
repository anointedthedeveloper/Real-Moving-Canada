/**
 * Checks that the API can reach MongoDB Atlas with the current settings and builds
 * the collection indexes:   npm run check:db
 */
import mongoose from 'mongoose';
import { connectDb, disconnectDb } from '../src/db.js';
import { config } from '../src/config.js';
import * as models from '../src/models/index.js';

try {
  const started = Date.now();
  await connectDb();
  await mongoose.connection.db.admin().command({ ping: 1 });
  console.log(`✔ Connected to MongoDB (database "${config.mongoDb}") in ${Date.now() - started} ms`);
  for (const model of Object.values(models)) await model.syncIndexes();
  console.log(`✔ Indexes ready for ${Object.keys(models).length} collections`);
} catch (err) {
  console.error('✘ Could not connect to MongoDB:', err.message);
  console.error('  Check MONGODB_URI, and that this machine’s IP is allowed in Atlas → Security → Network Access.');
  process.exitCode = 1;
} finally {
  await disconnectDb().catch(() => {});
}
