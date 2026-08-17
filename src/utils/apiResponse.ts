import { Response } from 'express';

export interface ApiResponseSuccess<T> {
  success: true;
  data: T;
}

export interface ApiResponseError {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: any;
  };
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export const sendSuccess = <T>(res: Response, data: T, statusCode: number = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
  } as ApiResponseSuccess<T>);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 400,
  code?: string,
  details?: any
) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(code && { code }),
      ...(details && { details }),
    },
  } as ApiResponseError);
};
