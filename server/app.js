import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';

import validateEnv from './config/validateEnv.js';
import securityHeaders from './middleware/securityHeaders.js';
import corsConfig from './middleware/corsConfig.js';
import sanitize from './middleware/sanitize.js';
import httpsOnly from './middleware/httpsOnly.js';
import { globalLimiter, authLimiter } from './middleware/rateLimiters.js';

import requestId from './middleware/requestId.js';
import logRequests from './middleware/logRequests.js';
import authRoutes from './routes/authRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import errorHandler from './middleware/errorHandler.js';

validateEnv();

const app = express();
app.set('trust proxy', 1);

app.use(requestId);
app.use(logRequests);

app.use(securityHeaders());
app.use(corsConfig);
app.use(httpsOnly);

app.use(cookieParser());
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(sanitize());

app.use(globalLimiter);
app.use('/api/v1', healthRoutes);
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/library', bookRoutes);

app.use(errorHandler);

export default app;