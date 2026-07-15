import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types/index.js';
import { activityService } from './activity.service.js';

export class ActivityController {
  async createActivity(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const activity = await activityService.createActivity(
        req.user!.id,
        req.params.leadId,
        req.body
      );

      res.status(201).json({
        success: true,
        data: activity,
      });
    } catch (error) {
      next(error);
    }
  }

  async listActivities(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const activities = await activityService.listActivities(
        req.user!.id,
        req.params.leadId
      );

      res.status(200).json({
        success: true,
        data: activities,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const activityController = new ActivityController();
