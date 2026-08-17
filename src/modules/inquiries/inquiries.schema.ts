import { z } from 'zod';
import { InquiryStatus } from '@prisma/client';

export const createInquirySchema = z.object({
  providerId: z.string().min(1, 'Provider ID is required'),
  message: z.string().min(5, 'Message must be at least 5 characters'),
});

export const updateInquiryStatusSchema = z.object({
  status: z.nativeEnum(InquiryStatus, {
    errorMap: () => ({ message: 'Invalid inquiry status' }),
  }),
});

export const getInquiriesQuerySchema = z.object({
  status: z.nativeEnum(InquiryStatus).optional(),
});

export type CreateInquiryInput = z.infer<typeof createInquirySchema>;
export type UpdateInquiryStatusInput = z.infer<typeof updateInquiryStatusSchema>;
export type GetInquiriesQuery = z.infer<typeof getInquiriesQuerySchema>;
