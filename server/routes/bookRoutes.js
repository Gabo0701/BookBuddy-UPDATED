import express from 'express';
import {
  getBooks,
  addBook,
  updateBook,
  deleteBook,
} from '../controllers/bookController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// All book routes protected
router.use(protect);

router.get('/', getBooks);
router.post('/', addBook);
router.put('/:id', updateBook);
router.delete('/:id', deleteBook);

export default router;