import { Router } from 'express';
import multer from 'multer';
import { providersController } from './providers.controller';
import { authenticate } from '../../middleware/auth';
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

// Sub-router for /me (Provider self-management)
const meRouter = Router();
meRouter.use(authenticate);

meRouter.post(
  '/',
  validate({ body: createProviderProfileSchema }),
  asyncHandler(providersController.createOwnProfile)
);

meRouter.get('/', asyncHandler(providersController.getOwnProfile));

meRouter.patch(
  '/',
  validate({ body: updateProviderProfileSchema }),
  asyncHandler(providersController.updateOwnProfile)
);

meRouter.put(
  '/',
  validate({ body: updateProviderProfileSchema }),
  asyncHandler(providersController.updateOwnProfile)
);

// Services management under /me/services
meRouter.post(
  '/services',
  validate({ body: createServiceSchema }),
  asyncHandler(providersController.addService)
);

meRouter.patch(
  '/services/:id',
  validate({ body: updateServiceSchema }),
  asyncHandler(providersController.updateService)
);

meRouter.delete('/services/:id', asyncHandler(providersController.deleteService));

// Photos management under /me/photos
meRouter.post(
  '/photos',
  upload.single('photo'),
  asyncHandler(providersController.addPhoto)
);

meRouter.delete('/photos/:id', asyncHandler(providersController.deletePhoto));

// Verification request under /me/verification
meRouter.post('/verification', asyncHandler(providersController.requestVerification));

// Mount meRouter at /me
router.use('/me', meRouter);

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

export default router;
