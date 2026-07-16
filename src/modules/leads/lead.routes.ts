import { Router } from 'express';
import { authenticateJwt } from '../../middleware/authenticate.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { leadController } from './lead.controller.js';
import { createLeadSchema, updateLeadSchema } from './lead.schemas.js';

export const leadRouter = Router();

leadRouter.use(authenticateJwt);

leadRouter.post('/', validate(createLeadSchema), leadController.createLead.bind(leadController));

leadRouter.get('/', leadController.listLeads.bind(leadController));

leadRouter.get('/:id', leadController.getLeadById.bind(leadController));

leadRouter.patch('/:id', validate(updateLeadSchema), leadController.updateLead.bind(leadController));

leadRouter.delete('/:id', leadController.deleteLead.bind(leadController));
