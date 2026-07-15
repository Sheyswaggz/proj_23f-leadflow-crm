import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service.js';

class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({
        success: true,
        data: result,
        message: 'Registration successful',
      });
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      res.status(200).json({
        success: true,
        data: result,
        message: 'Login successful',
      });
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
