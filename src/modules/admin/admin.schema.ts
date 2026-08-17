import { z } from 'zod';
import { VerificationStatus } from '@prisma/client';

export const getVerificationsQuerySchema = z.object({
  status: z.nativeEnum(VerificationStatus).optional().default(VerificationStatus.PENDING),
});

export const updateVerificationSchema = z.object({
  status: z.enum([VerificationStatus.VERIFIED, VerificationStatus.REJECTED], {
    errorMap: () => ({ message: 'Status must be VERIFIED or REJECTED' }),
  }),
});

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Category name is required'),
  icon: z.string().min(1, 'Category icon name is required'),
});

export const updateCategorySchema = createCategorySchema.partial();

export type GetVerificationsQuery = z.infer<typeof getVerificationsQuerySchema>;
export type UpdateVerificationInput = z.infer<typeof updateVerificationSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
