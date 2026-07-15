import { Router } from 'express';
import { authController } from './auth.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { registerSchema, loginSchema } from './auth.schemas.js';
import { authenticateJwt } from '../../middleware/authenticate.middleware.js';

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

authRouter.post(
  '/logout',
  authenticateJwt,
  authController.logout.bind(authController)
);

authRouter.get(
  '/me',
  authenticateJwt,
  authController.getMe.bind(authController)
);
