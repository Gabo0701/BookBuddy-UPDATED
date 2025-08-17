import express from 'express';
const router = express.Router();
import mongoose from 'mongoose';

router.get('/readyz', async (req, res) => {
  const state = mongoose.connection.readyState; // 1 = connected
  const ok = state === 1;
  res.status(ok ? 200 : 503).json({
    status: ok ? 'ready' : 'not-ready',
    mongo: state
  });
});

export default router;