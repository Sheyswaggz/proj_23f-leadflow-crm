import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types/index.js';
import { leadService } from './lead.service.js';
import { listLeadsQuerySchema } from './lead.schemas.js';

export class LeadController {
  async createLead(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const lead = await leadService.createLead(req.user!.id, req.body);

      res.status(201).json({
        success: true,
        data: lead,
      });
    } catch (err) {
      next(err);
    }
  }

  async listLeads(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const query = listLeadsQuerySchema.parse(req.query);
      const result = await leadService.listLeads(req.user!.id, query);

      res.status(200).json({
        success: true,
        data: {
          leads: result.leads,
          pagination: {
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async getLeadById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const lead = await leadService.getLeadById(req.user!.id, req.params.id);

      res.status(200).json({
        success: true,
        data: lead,
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteLead(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await leadService.deleteLead(req.user!.id, req.params.id);

      res.status(200).json({
        success: true,
        message: 'Lead deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  }
}

export const leadController = new LeadController();
