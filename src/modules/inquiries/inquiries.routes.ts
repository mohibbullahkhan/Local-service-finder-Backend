import { Router } from 'express';
import { Role } from '@prisma/client';
import { inquiriesController } from './inquiries.controller';
import { authenticate } from '../../middleware/auth';
import { roleGuard } from '../../middleware/roleGuard';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../utils/asyncHandler';
import {
  createInquirySchema,
  updateInquiryStatusSchema,
  getInquiriesQuerySchema,
} from './inquiries.schema';

const router = Router();

router.use(authenticate);

// Buyer inquiry routes
router.post(
  '/',
  roleGuard([Role.BUYER]),
  validate({ body: createInquirySchema }),
  asyncHandler(inquiriesController.createInquiry)
);

router.get(
  '/sent',
  roleGuard([Role.BUYER]),
  validate({ query: getInquiriesQuerySchema }),
  asyncHandler(inquiriesController.getSentInquiries)
);

// Provider inquiry routes
router.get(
  '/received',
  roleGuard([Role.PROVIDER]),
  validate({ query: getInquiriesQuerySchema }),
  asyncHandler(inquiriesController.getReceivedInquiries)
);

// Status update (Provider can accept/decline/complete/cancel; Buyer can cancel pending)
router.patch(
  '/:id/status',
  validate({ body: updateInquiryStatusSchema }),
  asyncHandler(inquiriesController.updateStatus)
);

export default router;
