import crypto from 'node:crypto';

// No 0/O/1/I so references are easy to read out over the phone.
const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

/** Short human-friendly reference such as "QR-7K4M9P". */
export function reference(prefix) {
  const bytes = crypto.randomBytes(6);
  let out = '';
  for (const b of bytes) out += ALPHABET[b % ALPHABET.length];
  return `${prefix}-${out}`;
}

export const randomToken = () => crypto.randomBytes(32).toString('base64url');
export const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');
