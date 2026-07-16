import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import * as Sentry from '@sentry/node';
import { logger } from '../lib/logger.js';
import { AppError, ApiResponse } from '../types/index.js';

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    logger.error({ err, statusCode: err.statusCode }, 'Request error');
    const response: ApiResponse = {
      success: false,
      error: {
        message: err.message,
        code: err.code,
      },
    };
    res.status(err.statusCode).json(response);
    return;
  }

  logger.error({ err, statusCode: 500 }, 'Request error');

  if (process.env['SENTRY_DSN']) {
    Sentry.captureException(err);
  }

  const response: ApiResponse = {
    success: false,
    error: {
      message: process.env['NODE_ENV'] === 'production'
        ? 'Internal server error'
        : err.message,
    },
  };

  res.status(500).json(response);
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new AppError(
    `Route ${req.method} ${req.originalUrl} not found`,
    404,
    'ROUTE_NOT_FOUND'
  );
  next(error);
};
