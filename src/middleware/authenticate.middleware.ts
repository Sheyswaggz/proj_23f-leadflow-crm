import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError, AuthenticatedRequest } from '../types/index.js';
import { isTokenBlacklisted } from '../lib/redis.js';

export async function authenticateJwt(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('Authentication required', 401);
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new AppError('Authentication required', 401);
    }

    if (await isTokenBlacklisted(token)) {
      throw new AppError('Token has been invalidated', 401);
    }

    const jwtSecret = process.env['JWT_SECRET'];
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined');
    }

    try {
      const decoded = jwt.verify(token, jwtSecret) as { userId: string; email: string };
      req.user = {
        id: decoded.userId,
        email: decoded.email,
        role: 'user',
      };
      next();
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        throw new AppError('Token expired', 401);
      }
      throw new AppError('Invalid token', 401);
    }
  } catch (err) {
    next(err);
  }
}
