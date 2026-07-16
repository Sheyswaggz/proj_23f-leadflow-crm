import { Router, Request, Response } from 'express';
import { ApiResponse } from '../types/index.js';
import { authRouter } from '../modules/auth/auth.routes.js';
import { leadRouter } from '../modules/leads/lead.routes.js';
import { activityRouter } from '../modules/activities/activity.routes.js';
import {
  leadRemindersRouter,
  userRemindersRouter,
} from '../modules/reminders/reminder.routes.js';
import { dashboardRouter } from '../modules/dashboard/dashboard.routes.js';

export const apiRouter = Router();

apiRouter.get('/ping', (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    data: { message: 'pong' },
  };

  res.status(200).json(response);
});

apiRouter.use('/auth', authRouter);
apiRouter.use('/leads', leadRouter);
apiRouter.use('/leads/:leadId/activities', activityRouter);
apiRouter.use('/leads/:leadId/reminders', leadRemindersRouter);
apiRouter.use('/reminders', userRemindersRouter);
apiRouter.use('/dashboard', dashboardRouter);
