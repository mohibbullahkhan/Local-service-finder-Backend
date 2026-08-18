import { Router } from 'express';
import { authController } from './auth.controller';
import { validate } from '../../middleware/validate';
import { registerSchema, loginSchema, refreshSchema, logoutSchema, resetPasswordSchema } from './auth.schema';
import { authenticate } from '../../middleware/auth';
import { asyncHandler } from '../../utils/asyncHandler';
import { authRateLimiter } from '../../middleware/rateLimiters';

const router = Router();

router.post(
  '/register',
  authRateLimiter,
  validate({ body: registerSchema }),
  asyncHandler(authController.register)
);

router.post(
  '/login',
  authRateLimiter,
  validate({ body: loginSchema }),
  asyncHandler(authController.login)
);

router.post(
  '/reset-password',
  authRateLimiter,
  validate({ body: resetPasswordSchema }),
  asyncHandler(authController.resetPassword)
);

router.post(
  '/refresh',
  authRateLimiter,
  validate({ body: refreshSchema }),
  asyncHandler(authController.refresh)
);

router.post(
  '/logout',
  validate({ body: logoutSchema }),
  asyncHandler(authController.logout)
);

router.get('/me', authenticate, asyncHandler(authController.getMe));

export default router;
