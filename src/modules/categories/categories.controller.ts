import { Request, Response } from 'express';
import { categoriesService } from './categories.service';
import { sendSuccess } from '../../utils/apiResponse';

export class CategoriesController {
  getCategories = async (req: Request, res: Response) => {
    const categories = await categoriesService.getCategories();
    return sendSuccess(res, categories);
  };
}

export const categoriesController = new CategoriesController();
