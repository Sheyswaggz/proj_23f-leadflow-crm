import { Router, Request, Response } from 'express';
import { ApiResponse } from '../types/index.js';

export const healthRouter = Router();

healthRouter.get('/', (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    },
  };

  res.status(200).json(response);
});
