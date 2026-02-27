import { Router } from 'express';
import { registerSchema, loginSchema } from '@devhub/shared';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from './auth.middleware.js';
import * as authController from './auth.controller.js';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', requireAuth, authController.logout);
router.get('/me', requireAuth, authController.getMe);

export { router as authRoutes };
