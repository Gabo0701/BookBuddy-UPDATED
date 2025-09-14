// User Model - MongoDB Schema for User Authentication and Profile
// Handles user registration, authentication, and profile management

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// Define user schema with validation rules
const userSchema = new mongoose.Schema({
  // Username field with comprehensive validation
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,                    // Ensure unique usernames
    lowercase: true,                 // Convert to lowercase for consistency
    trim: true,                      // Remove whitespace
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username must be less than 20 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  
  // Email field for authentication and communication
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,                    // Ensure unique email addresses
    lowercase: true                  // Convert to lowercase for consistency
  },
  
  // Password field with security considerations
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,                    // Minimum password length
    select: false                    // Hide password by default in queries
  },
  
  // Email verification status
  isEmailVerified: {
    type: Boolean,
    default: false                   // Users start with unverified email
  }
}, {
  timestamps: true                   // Automatically add createdAt & updatedAt fields
});

/**
 * Instance method to compare plain text password with hashed password
 * Used during login authentication process
 * 
 * @param {string} plain - Plain text password to compare
 * @returns {Promise<boolean>} - True if passwords match, false otherwise
 */
userSchema.methods.comparePassword = function(plain) {
  return bcrypt.compare(plain, this.password);
};

// Export User model
export default mongoose.model('User', userSchema);
