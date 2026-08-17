import { Router } from 'express';
import multer from 'multer';
import { Role } from '@prisma/client';
import { providersController } from './providers.controller';
import { authenticate } from '../../middleware/auth';
import { roleGuard } from '../../middleware/roleGuard';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../utils/asyncHandler';
import {
  getProvidersQuerySchema,
  createProviderProfileSchema,
  updateProviderProfileSchema,
  createServiceSchema,
  updateServiceSchema,
} from './providers.schema';
import { reviewsController } from '../reviews/reviews.controller';
import { getReviewsQuerySchema } from '../reviews/reviews.schema';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

const router = Router();

// Public routes
router.get(
  '/',
  validate({ query: getProvidersQuerySchema }),
  asyncHandler(providersController.listProviders)
);

router.get('/:id', asyncHandler(providersController.getProviderById));

router.get(
  '/:id/reviews',
  validate({ query: getReviewsQuerySchema }),
  asyncHandler(reviewsController.getProviderReviews)
);

// Provider self-management routes
router.use('/me', authenticate, roleGuard([Role.PROVIDER]));

router.post(
  '/me',
  validate({ body: createProviderProfileSchema }),
  asyncHandler(providersController.createOwnProfile)
);

router.get('/me', asyncHandler(providersController.getOwnProfile));

router.patch(
  '/me',
  validate({ body: updateProviderProfileSchema }),
  asyncHandler(providersController.updateOwnProfile)
);

// Services management
router.post(
  '/me/services',
  validate({ body: createServiceSchema }),
  asyncHandler(providersController.addService)
);

router.patch(
  '/me/services/:id',
  validate({ body: updateServiceSchema }),
  asyncHandler(providersController.updateService)
);

router.delete('/me/services/:id', asyncHandler(providersController.deleteService));

// Photos management
router.post(
  '/me/photos',
  upload.single('photo'),
  asyncHandler(providersController.addPhoto)
);

router.delete('/me/photos/:id', asyncHandler(providersController.deletePhoto));

// Verification request
router.post('/me/verification', asyncHandler(providersController.requestVerification));

export default router;
