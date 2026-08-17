import { z } from 'zod';

export const createReviewSchema = z.object({
  inquiryId: z.string().min(1, 'Inquiry ID is required'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  comment: z.string().optional().nullable(),
});

export const getReviewsQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val, 10)) : 1)),
  pageSize: z.string().optional().transform((val) => (val ? Math.max(1, Math.min(100, parseInt(val, 10))) : 10)),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type GetReviewsQuery = z.infer<typeof getReviewsQuerySchema>;
