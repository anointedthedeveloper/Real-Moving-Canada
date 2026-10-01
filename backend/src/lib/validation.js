import { z } from 'zod';

const trimmed = (max) => z.string().trim().max(max);
const optionalText = (max) => trimmed(max).optional().default('');

export const email = z.string().trim().toLowerCase().email('Enter a valid email address, like name@example.com.').max(254);
export const password = z.string().min(8, 'Use at least 8 characters.').max(200, 'Please use a shorter password.');
export const phone = z.string().trim().max(30).refine((v) => !v || v.replace(/\D/g, '').length >= 7, 'Enter a valid phone number.');

export const signupSchema = z.object({
  firstName: trimmed(60).min(1, 'Enter your first name.'),
  lastName: trimmed(60).min(1, 'Enter your last name.'),
  email,
  password,
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Enter your password.').max(200),
  remember: z.boolean().optional().default(false),
});

export const forgotSchema = z.object({ email });
export const resetSchema = z.object({ token: z.string().min(20).max(200), password });

const place = z.object({
  address: optionalText(160),
  city: trimmed(80).min(1, 'Enter a city.'),
  province: trimmed(10).min(1, 'Choose a province or territory.'),
  country: optionalText(60),
  postalCode: optionalText(12),
  propertyType: optionalText(40),
  rooms: optionalText(40),
});

export const quoteRequestSchema = z.object({
  firstName: trimmed(60).min(1, 'Enter your first name.'),
  lastName: trimmed(60).min(1, 'Enter your last name.'),
  email,
  phone: phone.refine((v) => v.length > 0, 'Enter a phone number.'),
  contactMethod: optionalText(20),
  createAccount: z.boolean().optional().default(false),
  origin: place,
  destination: place,
  moveDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Choose your preferred moving date.'),
  moveType: optionalText(30),
  services: z.array(trimmed(60)).max(20).optional().default([]),
  heavyItems: optionalText(500),
  storageDetails: optionalText(500),
  notes: optionalText(3000),
  _gotcha: z.string().optional(),
});

export const reviewSchema = z.object({
  name: trimmed(100).min(1, 'Enter your name.'),
  email,
  rating: z.coerce.number().int().min(1, 'Please choose a rating.').max(5),
  title: optionalText(100),
  body: trimmed(2000).min(20, 'Please write at least 20 characters.'),
  _gotcha: z.string().optional(),
});

export const profileSchema = z.object({
  firstName: trimmed(60).min(1, 'Enter your first name.'),
  lastName: trimmed(60).min(1, 'Enter your last name.'),
  email,
  phone: phone.optional().default(''),
  street: optionalText(160),
  city: optionalText(80),
  province: optionalText(10),
  postalCode: optionalText(12),
  contactMethod: z.enum(['', 'email', 'phone', 'text']).optional().default(''),
});

export const settingsSchema = z.object({
  notifications: z.object({
    moveUpdates: z.boolean(),
    quoteUpdates: z.boolean(),
    paymentUpdates: z.boolean(),
    documentUpdates: z.boolean(),
  }),
});

export const messageSchema = z.object({ body: trimmed(4000).min(1, 'Write a message first.') });
