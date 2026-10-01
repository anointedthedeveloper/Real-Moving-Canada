/**
 * Gives an existing account staff or admin access:
 *   npm run make:admin -- someone@example.com            (admin)
 *   npm run make:admin -- someone@example.com staff
 */
import { connectDb, disconnectDb } from '../src/db.js';
import { User } from '../src/models/index.js';

const [email, role = 'admin'] = process.argv.slice(2);
if (!email || !['staff', 'admin', 'customer'].includes(role)) {
  console.error('Usage: npm run make:admin -- <email> [admin|staff|customer]');
  process.exit(1);
}
await connectDb();
const user = await User.findOneAndUpdate({ email: email.toLowerCase() }, { role }, { new: true });
console.log(user ? `${user.email} is now ${role}.` : `No account found for ${email}. Sign up on the website first.`);
await disconnectDb();
