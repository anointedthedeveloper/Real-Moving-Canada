import mongoose from 'mongoose';
import { publicJson } from './shared.js';

const messageSchema = new mongoose.Schema({
  from: { type: String, enum: ['customer', 'team'], required: true },
  body: { type: String, required: true, maxlength: 4000 },
  sentAt: { type: Date, default: Date.now },
});

const conversationSchema = new mongoose.Schema({
  reference: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  subject: { type: String, required: true, maxlength: 150 },
  moveReference: String,
  messages: [messageSchema],
  unreadForCustomer: { type: Boolean, default: false },
  unreadForTeam: { type: Boolean, default: false },
}, { timestamps: true });

publicJson(conversationSchema, (out) => {
  const messages = (out.messages || []).map((m) => ({ id: String(m._id), from: m.from, body: m.body, sentAt: m.sentAt }));
  const last = messages.at(-1);
  return {
    id: out.reference,
    subject: out.subject,
    reference: out.moveReference || out.reference,
    preview: last?.body?.slice(0, 120) || '',
    updatedAt: out.updatedAt,
    unread: !!out.unreadForCustomer,
    messages,
  };
});

export default mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema);
