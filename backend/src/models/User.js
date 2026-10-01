import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true, maxlength: 60 },
  lastName: { type: String, required: true, trim: true, maxlength: 60 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['customer', 'staff', 'admin'], default: 'customer' },
  phone: { type: String, trim: true, maxlength: 30 },
  street: { type: String, trim: true, maxlength: 160 },
  city: { type: String, trim: true, maxlength: 80 },
  province: { type: String, trim: true, maxlength: 10 },
  postalCode: { type: String, trim: true, maxlength: 12 },
  contactMethod: { type: String, enum: ['', 'email', 'phone', 'text'], default: '' },
  notifications: {
    moveUpdates: { type: Boolean, default: true },
    quoteUpdates: { type: Boolean, default: true },
    paymentUpdates: { type: Boolean, default: true },
    documentUpdates: { type: Boolean, default: false },
  },
  failedLogins: { type: Number, default: 0, select: false },
  lockUntil: { type: Date, select: false },
  passwordChangedAt: { type: Date, select: false },
  lastLoginAt: Date,
}, { timestamps: true });

userSchema.set('toJSON', {
  versionKey: false,
  transform(_doc, ret) {
    const out = { id: String(ret._id), ...ret };
    delete out._id;
    delete out.passwordHash;
    delete out.failedLogins;
    delete out.lockUntil;
    delete out.passwordChangedAt;
    return out;
  },
});

export default mongoose.models.User || mongoose.model('User', userSchema);
