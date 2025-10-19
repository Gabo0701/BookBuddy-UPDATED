import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

// Basic middleware
app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Test routes
app.get('/', (req, res) => {
  res.json({ message: 'BookBuddy API is running' });
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working', timestamp: new Date().toISOString() });
});

// Import and mount auth routes directly
try {
  const { default: authRoutes } = await import('./routes/authRoutes.js');
  app.use('/api/v1/auth', authRoutes);
  console.log('✅ Auth routes mounted');
} catch (error) {
  console.error('❌ Failed to load auth routes:', error.message);
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;