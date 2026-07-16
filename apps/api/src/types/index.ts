import { Request } from 'express';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthTokenPayload {
  id: string;
  userId: string;
  email: string;
  role: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string | { message: string; code?: string };
  message?: string;
}

export class AppError extends Error {
  statusCode: number;
  code?: string;

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export interface AuthenticatedRequest extends Request {
  user?: AuthTokenPayload;
}
