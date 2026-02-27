import { Router } from 'express';
import { updateProfileSchema, changePasswordSchema } from '@devhub/shared';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../auth/auth.middleware.js';
import * as userController from './user.controller.js';

const router = Router();

router.get('/:username', userController.getProfile);
router.patch('/me', requireAuth, validate(updateProfileSchema), userController.updateProfile);
router.post('/me/password', requireAuth, validate(changePasswordSchema), userController.changePassword);

export { router as userRoutes };
