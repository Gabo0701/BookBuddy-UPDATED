import mongoose from 'mongoose';

const accountDeletionRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  email: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processed', 'cancelled'],
    default: 'pending'
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  processedAt: {
    type: Date
  }
});

export default mongoose.model('AccountDeletionRequest', accountDeletionRequestSchema);