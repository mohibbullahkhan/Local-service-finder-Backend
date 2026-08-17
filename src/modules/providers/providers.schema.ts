import { z } from 'zod';

export const getProvidersQuerySchema = z.object({
  city: z.string().optional(),
  area: z.string().optional(),
  category: z.string().optional(),
  q: z.string().optional(),
  page: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val, 10)) : 1)),
  pageSize: z.string().optional().transform((val) => (val ? Math.max(1, Math.min(100, parseInt(val, 10))) : 10)),
});

export const createProviderProfileSchema = z.object({
  businessName: z.string().min(2, 'Business name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  city: z.string().min(1, 'City is required'),
  area: z.string().min(1, 'Area is required'),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  categoryIds: z.array(z.string()).min(1, 'At least one category is required'),
});

export const updateProviderProfileSchema = createProviderProfileSchema.partial();

export const createServiceSchema = z.object({
  name: z.string().min(1, 'Service name is required'),
  priceMin: z.number().int().nonnegative().optional().nullable(),
  priceMax: z.number().int().nonnegative().optional().nullable(),
  unit: z.string().optional().nullable(),
});

export const updateServiceSchema = createServiceSchema.partial();

export const addPhotoSchema = z.object({
  url: z.string().optional(),
  isCover: z.boolean().default(false),
});

export type GetProvidersQuery = z.infer<typeof getProvidersQuerySchema>;
export type CreateProviderProfileInput = z.infer<typeof createProviderProfileSchema>;
export type UpdateProviderProfileInput = z.infer<typeof updateProviderProfileSchema>;
export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
export type AddPhotoInput = z.infer<typeof addPhotoSchema>;
