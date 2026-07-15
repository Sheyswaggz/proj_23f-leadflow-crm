import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types/index.js';
import { dashboardService } from './dashboard.service.js';

export class DashboardController {
  async getStats(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const stats = await dashboardService.getStats(req.user!.id);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const dashboardController = new DashboardController();
