import { z } from 'zod';

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
