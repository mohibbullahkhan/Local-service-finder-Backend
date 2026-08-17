import { Router } from 'express';
import { categoriesController } from './categories.controller';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

router.get('/', asyncHandler(categoriesController.getCategories));

export default router;
