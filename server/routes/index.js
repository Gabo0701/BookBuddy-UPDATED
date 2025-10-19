import express from 'express';
import authRoutes from './authRoutes.js';
import bookRoutes from './bookRoutes.js';
import healthRoutes from './healthRoutes.js';

const router = express.Router();

router.use('/v1/auth', authRoutes);
router.use('/v1/books', bookRoutes);
router.use('/v1/health', healthRoutes);

export default router;