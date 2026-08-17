import { Router } from 'express';
import { Role } from '@prisma/client';
import { favoritesController } from './favorites.controller';
import { authenticate } from '../../middleware/auth';
import { roleGuard } from '../../middleware/roleGuard';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

router.use(authenticate, roleGuard([Role.BUYER]));

router.get('/', asyncHandler(favoritesController.getFavorites));
router.post('/:providerId', asyncHandler(favoritesController.addFavorite));
router.delete('/:providerId', asyncHandler(favoritesController.removeFavorite));

export default router;
