import { Router } from 'express';
import { usersController } from './users.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { updateUserSchema } from './users.schema';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

router.get(
  '/me',
  authenticate,
  asyncHandler(usersController.getMe)
);

router.patch(
  '/me',
  authenticate,
  validate({ body: updateUserSchema }),
  asyncHandler(usersController.updateMe)
);

router.put(
  '/me',
  authenticate,
  validate({ body: updateUserSchema }),
  asyncHandler(usersController.updateMe)
);

export default router;
