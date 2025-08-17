import express from 'express';
import {
  getLibrary,
  getBooks,
  addBook,
  updateBook,
  deleteBook,
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
router.post('/', addBook);
router.put('/:id', updateBook);
router.delete('/:id', deleteBook);
router.get('/reading-log', getReadingLog);
router.post('/reading-log', addReadingLogEntry);
router.get('/recommendations', getRecommendations);

export default router;