import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';

import { env } from './config/env';
import { globalRateLimiter } from './middleware/rateLimiters';
import { errorHandler } from './middleware/errorHandler';
import { sendSuccess } from './utils/apiResponse';

import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import categoriesRoutes from './modules/categories/categories.routes';
import providersRoutes from './modules/providers/providers.routes';
import favoritesRoutes from './modules/favorites/favorites.routes';
import inquiriesRoutes from './modules/inquiries/inquiries.routes';
import reviewsRoutes from './modules/reviews/reviews.routes';
import adminRoutes from './modules/admin/admin.routes';

const app: Application = express();

// Security and standard middlewares
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply global rate limiting to all requests
app.use(globalRateLimiter);

// Static uploads directory serving
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Welcome root endpoint
app.get('/', (req: Request, res: Response) => {
  return sendSuccess(res, {
    message: 'LocalConnect Backend API is live and operational!',
    healthCheck: '/api/health',
    documentation: 'https://github.com/mohibbullahkhan/Local-service-finder-Backend',
  });
});

// Uptime healthcheck endpoint
app.get('/api/health', (req: Request, res: Response) => {
  return sendSuccess(res, {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// API Routes setup
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/providers', providersRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/inquiries', inquiriesRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/admin', adminRoutes);

// Catch-all 404 handler for unknown endpoints
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.originalUrl} not found`,
      code: 'ROUTE_NOT_FOUND',
    },
  });
});

// Centralized error handler
app.use(errorHandler);

export default app;
