import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGIN: z.string().default('*'),
  DATABASE_URL: z.string().min(1, { message: 'DATABASE_URL is required' }),
  DIRECT_URL: z.string().optional(),
  JWT_ACCESS_SECRET: z.string().min(1, { message: 'JWT_ACCESS_SECRET is required' }),
  JWT_REFRESH_SECRET: z.string().min(1, { message: 'JWT_REFRESH_SECRET is required' }),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables configuration:');
  console.error(JSON.stringify(_env.error.format(), null, 2));
  throw new Error('Environment variable validation failed. Check your .env file.');
}

export const env = _env.data;
