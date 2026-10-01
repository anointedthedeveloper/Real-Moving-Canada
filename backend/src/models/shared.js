import mongoose from 'mongoose';

/** Address/route location — the same shape the frontend's quote form sends. */
export const placeSchema = new mongoose.Schema({
  address: { type: String, trim: true, maxlength: 160 },
  city: { type: String, trim: true, maxlength: 80 },
  province: { type: String, trim: true, maxlength: 10 },
  country: { type: String, trim: true, maxlength: 60 },
  postalCode: { type: String, trim: true, maxlength: 12 },
  propertyType: { type: String, trim: true, maxlength: 40 },
  rooms: { type: String, trim: true, maxlength: 40 },
}, { _id: false });

/** Removes Mongo internals from JSON output and exposes the reference as `id`. */
export function publicJson(schema, transform) {
  schema.set('toJSON', {
    versionKey: false,
    transform(doc, ret) {
      const out = { ...ret, id: ret.reference || String(ret._id) };
      delete out._id;
      delete out.userId;
      return transform ? transform(out, doc) : out;
    },
  });
}

export const { model, models, Schema } = mongoose;
