import mongoose from 'mongoose';

const authEventSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: {
    type: String,
    enum: ['register', 'login', 'logout'],
    required: true
  },
}, {
  timestamps: true   // adds createdAt & updatedAt
});

const AuthEvent = mongoose.model('AuthEvent', authEventSchema);
export default AuthEvent;