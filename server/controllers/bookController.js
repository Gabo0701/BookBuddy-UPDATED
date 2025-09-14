import Book from '../models/Book.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

// GET /api/v1/library - Library overview
export const getLibrary = async (req, res) => {
  try {
    const userId = req.user.id;
    const books = await Book.find({ user: userId });
    console.log('Found books for user:', userId, books.length);
    
    // Mock library structure for now
    const library = {
      lists: [{
        id: 'saved',
        name: 'Saved Books',
        type: 'saved',
        books: books.map(book => ({
          id: book._id,
          book: book,
          status: 'saved',
          addedAt: book.createdAt
        }))
      }],

      goal: {
        year: new Date().getFullYear(),
        targetBooks: 24,
        currentBooks: books.length
      }
    };
    
    res.json(library);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/books
export const getBooks = async (req, res) => {
  try {
    const books = await Book.find({ user: req.user.id });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/books
export const addBook = async (req, res) => {
  try {
    const { title, author, key, coverId, olid } = req.body;
    console.log('Adding book:', { title, author, key, userId: req.user.id });
    
    // Check if book already exists for this user
    const existingBook = await Book.findOne({ key, user: req.user.id });
    if (existingBook) {
      console.log('Book already exists:', existingBook);
      return res.status(200).json(existingBook);
    }
    
    const newBook = new Book({ 
      title, 
      author, 
      key, 
      coverId, 
      olid, 
      user: req.user.id 
    });
    
    const savedBook = await newBook.save();
    console.log('Book saved successfully:', savedBook);
    res.status(201).json(savedBook);
  } catch (error) {
    console.error('Error saving book:', error);
    if (error.code === 11000) {
      return res.status(200).json({ message: 'Book already saved' });
    }
    res.status(400).json({ message: error.message });
  }
};

// POST /api/books/favorite/:key
export const toggleFavorite = async (req, res) => {
  try {
    const { key } = req.params;
    let book = await Book.findOne({ key, user: req.user.id });
    
    if (!book) {
      const { title, author, coverId, olid } = req.body;
      book = new Book({ 
        title, 
        author, 
        key, 
        coverId, 
        olid, 
        user: req.user.id,
        isFavorite: true
      });
      await book.save();
    } else {
      book.isFavorite = !book.isFavorite;
      await book.save();
    }
    
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/books/key/:key
export const deleteBookByKey = async (req, res) => {
  try {
    const { key } = req.params;
    const deletedBook = await Book.findOneAndDelete({ key, user: req.user.id });
    
    if (!deletedBook) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    res.json({ message: 'Book deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/books/:id
export const updateBook = async (req, res) => {
  try {
    // Validate ObjectId format to prevent NoSQL injection
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid book ID format' });
    }

    const updated = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!updated) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE /api/books/:id
export const deleteBook = async (req, res) => {
  try {
    // Validate ObjectId format to prevent NoSQL injection
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid book ID format' });
    }

    const deletedBook = await Book.findByIdAndDelete(req.params.id);
    
    if (!deletedBook) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    res.json({ message: 'Book deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/v1/library/reading-log
export const getReadingLog = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const readingLog = [];
    res.json(readingLog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/v1/library/reading-log
export const addReadingLogEntry = async (req, res) => {
  try {
    const entry = { ...req.body, userId: req.user.id, id: Date.now().toString() };
    res.status(201).json(entry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

