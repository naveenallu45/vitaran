import { Request, Response, NextFunction } from 'express';
import { envs } from '../config/envs';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const statusCode = err.status || err.statusCode || 500;
  
  // Format Zod errors
  if (err.name === 'ValidationError' || err.errors) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: Object.values(err.errors || {}).map((e: any) => e.message || e),
    });
    return;
  }

  // Handle Mongo unique key constraint (e.g. duplicate email)
  if (err.code === 11000) {
    res.status(409).json({
      success: false,
      message: 'Duplicate key error: Resource already exists',
      errors: [Object.keys(err.keyValue || {}).map(key => `${key} already registered`).join(', ')],
    });
    return;
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    errors: envs.NODE_ENV === 'development' ? [err.stack] : [],
  });
}
