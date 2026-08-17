import { Router } from 'express';
import { Role } from '@prisma/client';
import { reviewsController } from './reviews.controller';
import { authenticate } from '../../middleware/auth';
import { roleGuard } from '../../middleware/roleGuard';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../utils/asyncHandler';
import { createReviewSchema, getReviewsQuerySchema } from './reviews.schema';

const router = Router();

// Submit a review (Buyer only)
router.post(
  '/',
  authenticate,
  roleGuard([Role.BUYER]),
  validate({ body: createReviewSchema }),
  asyncHandler(reviewsController.createReview)
);

// Public provider reviews endpoint
router.get(
  '/providers/:id/reviews',
  validate({ query: getReviewsQuerySchema }),
  asyncHandler(reviewsController.getProviderReviews)
);

export default router;
