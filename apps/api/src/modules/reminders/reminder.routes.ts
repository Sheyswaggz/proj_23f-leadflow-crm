import { Router } from 'express';
import { authenticateJwt } from '../../middleware/authenticate.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { reminderController } from './reminder.controller.js';
import { createReminderSchema, updateReminderSchema } from './reminder.schemas.js';

export const leadRemindersRouter = Router({ mergeParams: true });

leadRemindersRouter.use(authenticateJwt);
leadRemindersRouter.post(
  '/',
  validate(createReminderSchema),
  reminderController.createReminder.bind(reminderController)
);
leadRemindersRouter.get('/', reminderController.listByLead.bind(reminderController));

export const userRemindersRouter = Router();

userRemindersRouter.use(authenticateJwt);
userRemindersRouter.get('/', reminderController.listByUser.bind(reminderController));
userRemindersRouter.patch(
  '/:id',
  validate(updateReminderSchema),
  reminderController.updateReminder.bind(reminderController)
);
userRemindersRouter.delete('/:id', reminderController.deleteReminder.bind(reminderController));
