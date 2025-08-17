import Book from '../models/Book.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

// GET /api/v1/library - Library overview
export const getLibrary = async (req, res) => {
  try {
    const userId = req.user.id;
    const books = await Book.find({ userId });
    
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
      stats: {
        totalBooks: books.length,
        totalPages: books.reduce((sum, book) => sum + (book.pageCount || 0), 0),
        booksThisYear: books.filter(book => 
          book.createdAt && book.createdAt.getFullYear() === new Date().getFullYear()
        ).length
      },
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
    const books = await Book.find({ userId: req.user.id });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/books
export const addBook = async (req, res) => {
  const newBook = new Book({ ...req.body, userId: req.user.id });
  try {
    const savedBook = await newBook.save();
    res.status(201).json(savedBook);
  } catch (error) {
    res.status(400).json({ message: error.message });
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

// GET /api/v1/library/recommendations
export const getRecommendations = async (req, res) => {
  try {
    const recommendations = [];
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};