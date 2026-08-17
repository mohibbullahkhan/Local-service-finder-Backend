import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/AppError';
import { sendError } from '../utils/apiResponse';
import { env } from '../config/env';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log unexpected internal errors in development
  if (env.NODE_ENV === 'development') {
    console.error('[Error Handler]:', err);
  }

  // 1. Zod Validation Errors
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return sendError(res, 'Validation failed', 400, 'VALIDATION_ERROR', formattedErrors);
  }

  // 2. Custom App operational errors
  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode, err.code);
  }

  // 3. Prisma Known Client Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': {
        const fields = (err.meta?.target as string[]) || [];
        const fieldName = fields.join(', ');
        return sendError(
          res,
          `A record with this ${fieldName || 'field'} already exists`,
          409,
          'DUPLICATE_ENTRY'
        );
      }
      case 'P2025':
        return sendError(res, 'Requested record not found', 404, 'NOT_FOUND');
      case 'P2003':
        return sendError(res, 'Invalid referenced record ID', 400, 'FOREIGN_KEY_VIOLATION');
      default:
        return sendError(res, `Database error: ${err.message}`, 400, 'DATABASE_ERROR');
    }
  }

  // 4. Default Fallback Internal Error
  const message =
    env.NODE_ENV === 'production' ? 'Internal server error' : err.message || 'Unknown error occurred';
  return sendError(res, message, 500, 'INTERNAL_SERVER_ERROR');
};
