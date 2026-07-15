import { Router } from 'express';
import { authenticateJwt } from '../../middleware/authenticate.middleware.js';
import { dashboardController } from './dashboard.controller.js';

export const dashboardRouter = Router();

dashboardRouter.use(authenticateJwt);

dashboardRouter.get('/stats', dashboardController.getStats.bind(dashboardController));
