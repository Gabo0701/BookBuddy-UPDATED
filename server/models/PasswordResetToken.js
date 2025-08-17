import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tokenHash: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },  // ⬅ remove index:true
  usedAt:    { type: Date, default: null }
}, { timestamps: true });

schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
schema.index({ user: 1 });

export default mongoose.model('PasswordResetToken', schema);