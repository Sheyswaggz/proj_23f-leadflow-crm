import { Response } from 'express';
import { reminderService } from './reminder.service.js';
import { AuthenticatedRequest } from '../../types/index.js';
import { listRemindersQuerySchema } from './reminder.schemas.js';

class ReminderController {
  async createReminder(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { leadId } = req.params;
      const reminder = await reminderService.createReminder(userId, leadId, req.body);
      res.status(201).json({ success: true, data: reminder });
    } catch (error) {
      throw error;
    }
  }

  async listByLead(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { leadId } = req.params;
      const reminders = await reminderService.listByLead(userId, leadId);
      res.status(200).json({ success: true, data: reminders });
    } catch (error) {
      throw error;
    }
  }

  async listByUser(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const parseResult = listRemindersQuerySchema.safeParse(req.query);
      const status = parseResult.success ? parseResult.data.status : 'all';
      const reminders = await reminderService.listByUser(userId, status);
      res.status(200).json({ success: true, data: reminders });
    } catch (error) {
      throw error;
    }
  }

  async updateReminder(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const reminder = await reminderService.updateReminder(userId, id, req.body);
      res.status(200).json({ success: true, data: reminder });
    } catch (error) {
      throw error;
    }
  }

  async deleteReminder(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      await reminderService.deleteReminder(userId, id);
      res.status(200).json({ success: true, data: { message: 'Reminder deleted' } });
    } catch (error) {
      throw error;
    }
  }
}

export const reminderController = new ReminderController();
