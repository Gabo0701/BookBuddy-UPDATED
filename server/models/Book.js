// Book Model - MongoDB Schema for User's Book Library
// Stores books saved by users with OpenLibrary integration

import mongoose from 'mongoose';

// Define book schema for user's personal library
const bookSchema = new mongoose.Schema({
  // Basic book information
  title: { 
    type: String, 
    required: true     // Book title is mandatory
  },
  author: { 
    type: String, 
    required: true     // Author name is mandatory
  },
  
  // OpenLibrary integration fields
  key: { 
    type: String, 
    required: true     // OpenLibrary unique key identifier
  },
  coverId: { 
    type: String       // OpenLibrary cover image ID (optional)
  },
  olid: { 
    type: String       // OpenLibrary ID (optional)
  },
  
  // User interaction fields
  isFavorite: { 
    type: Boolean, 
    default: false     // Track if user marked book as favorite
  },
  
  // User association
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',       // Reference to User model
    required: true     // Every book must belong to a user
  },
}, {
  timestamps: true     // Automatically add createdAt & updatedAt fields
});

// Create compound index to ensure each user can only save a book once
// Prevents duplicate books in a user's library
bookSchema.index({ key: 1, user: 1 }, { unique: true });

// Export Book model
export default mongoose.model('Book', bookSchema);