import cors from 'cors';

const allowedOrigins = [
  process.env.CLIENT_URL,           // e.g. http://localhost:3000
  'http://localhost:5173',          // Default Vite port
  'http://localhost:5174',          // Alternative Vite port
  'http://localhost:3000'           // Fallback
].filter(Boolean);

export default cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
});
