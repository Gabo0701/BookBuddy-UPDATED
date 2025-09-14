import mongoose from 'mongoose';

const verificationCodeSchema = new mongoose.Schema({
  email: { type: String, required: true },
  code: { type: String, required: true },
  type: { type: String, enum: ['login', 'registration'], required: true },
  expiresAt: { type: Date, required: true, default: () => new Date(Date.now() + 10 * 60 * 1000) },
  used: { type: Boolean, default: false }
}, {
  timestamps: true
});

verificationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('VerificationCode', verificationCodeSchema);