import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service.js';
import { passwordResetService } from './password-reset.service.js';
import { AuthenticatedRequest } from '../../types/index.js';

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

  async logout(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        throw new Error('Authorization header is required');
      }
      const token = authHeader.split(' ')[1];
      await authService.logout(token);
      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (err) {
      next(err);
    }
  }

  async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await authService.getCurrentUser(req.user!.id);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (err) {
      next(err);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await passwordResetService.requestReset(req.body.email);
      res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a reset link has been sent.',
      });
    } catch (err) {
      next(err);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await passwordResetService.resetPassword(req.body.token, req.body.password);
      res.status(200).json({
        success: true,
        message: 'Password reset successfully',
      });
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
