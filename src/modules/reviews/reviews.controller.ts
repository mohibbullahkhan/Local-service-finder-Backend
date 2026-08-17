import { Request, Response } from 'express';
import { reviewsService } from './reviews.service';
import { sendSuccess } from '../../utils/apiResponse';

export class ReviewsController {
  createReview = async (req: Request, res: Response) => {
    const buyerId = req.user!.id;
    const review = await reviewsService.createReview(buyerId, req.body);
    return sendSuccess(res, review, 201);
  };

  getProviderReviews = async (req: Request, res: Response) => {
    const providerId = req.params.id as string;
    const result = await reviewsService.getProviderReviews(providerId, req.query as any);
    return sendSuccess(res, result);
  };
}

export const reviewsController = new ReviewsController();
