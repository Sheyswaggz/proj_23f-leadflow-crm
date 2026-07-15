import { Router } from 'express';
import { authenticateJwt } from '../../middleware/authenticate.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { activityController } from './activity.controller.js';
import { createActivitySchema } from './activity.schemas.js';

export const activityRouter = Router({ mergeParams: true });

activityRouter.use(authenticateJwt);

activityRouter.post(
  '/',
  validate(createActivitySchema),
  activityController.createActivity.bind(activityController)
);

activityRouter.get(
  '/',
  activityController.listActivities.bind(activityController)
);
