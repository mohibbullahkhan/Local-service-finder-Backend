import { z } from 'zod';

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().min(10).optional(),
  email: z.string().email().optional().nullable(),
  avatarUrl: z.string().optional().nullable(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
