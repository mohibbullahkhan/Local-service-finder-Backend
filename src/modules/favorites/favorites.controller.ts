import { Request, Response } from 'express';
import { favoritesService } from './favorites.service';
import { sendSuccess } from '../../utils/apiResponse';

export class FavoritesController {
  getFavorites = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const favorites = await favoritesService.getFavorites(userId);
    return sendSuccess(res, favorites);
  };

  addFavorite = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const providerId = req.params.providerId as string;
    const favorite = await favoritesService.addFavorite(userId, providerId);
    return sendSuccess(res, favorite, 201);
  };

  removeFavorite = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const providerId = req.params.providerId as string;
    const result = await favoritesService.removeFavorite(userId, providerId);
    return sendSuccess(res, result);
  };
}

export const favoritesController = new FavoritesController();
