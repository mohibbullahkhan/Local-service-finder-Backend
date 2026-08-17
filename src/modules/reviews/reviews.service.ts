import { InquiryStatus } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/AppError';
import { CreateReviewInput, GetReviewsQuery } from './reviews.schema';

export class ReviewsService {
  async createReview(buyerId: string, input: CreateReviewInput) {
    const inquiry = await prisma.inquiry.findUnique({
      where: { id: input.inquiryId },
      include: { review: true },
    });

    if (!inquiry) {
      throw new AppError('Inquiry not found', 404, 'INQUIRY_NOT_FOUND');
    }

    if (inquiry.buyerId !== buyerId) {
      throw new AppError('You can only review inquiries you initiated', 403, 'UNAUTHORIZED_REVIEW');
    }

    if (inquiry.status !== InquiryStatus.COMPLETED) {
      throw new AppError(
        'Reviews can only be submitted for COMPLETED inquiries',
        400,
        'INQUIRY_NOT_COMPLETED'
      );
    }

    if (inquiry.review) {
      throw new AppError('A review has already been submitted for this inquiry', 409, 'REVIEW_ALREADY_EXISTS');
    }

    // Execute review creation and provider rating recalculation in a single DB transaction
    return prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: {
          inquiryId: input.inquiryId,
          buyerId,
          providerId: inquiry.providerId,
          rating: input.rating,
          comment: input.comment || null,
        },
        include: {
          buyer: { select: { id: true, name: true, avatarUrl: true } },
        },
      });

      // Recalculate average rating & rating count
      const aggregate = await tx.review.aggregate({
        where: { providerId: inquiry.providerId },
        _avg: { rating: true },
        _count: { rating: true },
      });

      const ratingAvg = aggregate._avg.rating || 0;
      const ratingCount = aggregate._count.rating || 0;

      await tx.providerProfile.update({
        where: { id: inquiry.providerId },
        data: {
          ratingAvg: Math.round(ratingAvg * 10) / 10,
          ratingCount,
        },
      });

      return review;
    });
  }

  async getProviderReviews(providerId: string, query: GetReviewsQuery) {
    const { page, pageSize } = query;
    const skip = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
      prisma.review.findMany({
        where: { providerId },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          buyer: { select: { id: true, name: true, avatarUrl: true } },
        },
      }),
      prisma.review.count({ where: { providerId } }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
    };
  }
}

export const reviewsService = new ReviewsService();
