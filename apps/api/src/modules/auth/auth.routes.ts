import { Router } from 'express';
import { authController } from './auth.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './auth.schemas.js';
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

authRouter.post(
  '/forgot-password',
  validate(forgotPasswordSchema),
  authController.forgotPassword.bind(authController)
);

authRouter.post(
  '/reset-password',
  validate(resetPasswordSchema),
  authController.resetPassword.bind(authController)
);
