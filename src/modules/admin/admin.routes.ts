import { Router } from 'express';
import { Role } from '@prisma/client';
import { adminController } from './admin.controller';
import { authenticate } from '../../middleware/auth';
import { roleGuard } from '../../middleware/roleGuard';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../utils/asyncHandler';
import {
  getVerificationsQuerySchema,
  updateVerificationSchema,
  createCategorySchema,
  updateCategorySchema,
} from './admin.schema';

const router = Router();

// Protect all admin routes with authentication & ADMIN role
router.use(authenticate, roleGuard([Role.ADMIN]));

router.get(
  '/verifications',
  validate({ query: getVerificationsQuerySchema }),
  asyncHandler(adminController.getVerifications)
);

router.patch(
  '/verifications/:providerId',
  validate({ body: updateVerificationSchema }),
  asyncHandler(adminController.updateVerification)
);

router.get('/stats', asyncHandler(adminController.getStats));

router.post(
  '/categories',
  validate({ body: createCategorySchema }),
  asyncHandler(adminController.createCategory)
);

router.patch(
  '/categories/:id',
  validate({ body: updateCategorySchema }),
  asyncHandler(adminController.updateCategory)
);

export default router;
