import express from 'express';
import {
  getLibrary,
  getBooks,
  addBook,
  updateBook,
  deleteBook,
  toggleFavorite,
  deleteBookByKey,
  getReadingLog,
  addReadingLogEntry,
  getRecommendations,
} from '../controllers/bookController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// All book routes protected
router.use(protect);

router.get('/', getLibrary);
router.get('/books', getBooks);
router.post('/books', addBook);
router.post('/books/favorite/:key', toggleFavorite);
router.delete('/books/key/:key', deleteBookByKey);
router.put('/books/:id', updateBook);
router.delete('/books/:id', deleteBook);
router.get('/reading-log', getReadingLog);
router.post('/reading-log', addReadingLogEntry);
router.get('/recommendations', getRecommendations);

// Test endpoint
router.get('/test', async (req, res) => {
  try {
    console.log('Test endpoint hit by user:', req.user.id);
    const bookCount = await Book.countDocuments({ user: req.user.id });
    const allBooks = await Book.find({ user: req.user.id });
    res.json({ 
      message: 'Test successful', 
      userId: req.user.id, 
      bookCount,
      books: allBooks
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;