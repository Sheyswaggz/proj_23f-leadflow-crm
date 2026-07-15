import { Router } from 'express';
import { authController } from './auth.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { registerSchema, loginSchema } from './auth.schemas.js';

export const authRouter = Router();

authRouter.post(
  '/register',
  validate(registerSchema),
  authController.register.bind(authController)
);

authRouter.post(
  '/login',
  validate(loginSchema),
  authController.login.bind(authController)
);
