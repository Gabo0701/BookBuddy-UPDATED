import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  key: { type: String, required: true }, // OpenLibrary key
  coverId: { type: String }, // OpenLibrary cover ID
  olid: { type: String }, // OpenLibrary ID
  isFavorite: { type: Boolean, default: false },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  timestamps: true
});

// Ensure unique books per user
bookSchema.index({ key: 1, user: 1 }, { unique: true });

export default mongoose.model('Book', bookSchema);