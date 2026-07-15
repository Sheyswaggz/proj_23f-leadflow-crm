import { Router, Request, Response } from 'express';
import { ApiResponse } from '../types/index.js';

export const apiRouter = Router();

apiRouter.get('/ping', (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    data: { message: 'pong' },
  };

  res.status(200).json(response);
});
