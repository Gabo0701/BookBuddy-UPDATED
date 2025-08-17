import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jti:       { type: String, required: true, unique: true }, // unique index ok
  expiresAt: { type: Date, required: true },                  // ⬅ remove index:true
  revokedAt: { type: Date, default: null }
}, { timestamps: true });

// TTL index (keep this)
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Helpful secondary indexes (optional)
schema.index({ user: 1 });

export default mongoose.model('RefreshToken', schema);