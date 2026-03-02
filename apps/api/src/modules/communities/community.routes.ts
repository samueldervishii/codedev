import { Router } from 'express';
import { createCommunitySchema, updateCommunitySchema } from '@devhub/shared';
import { validate } from '../../middleware/validate.js';
import { writeLimiter } from '../../middleware/rateLimiter.js';
import { requireAuth } from '../auth/auth.middleware.js';
import * as communityController from './community.controller.js';

const router = Router();

router.post('/', requireAuth, writeLimiter, validate(createCommunitySchema), communityController.create);
router.get('/', communityController.list);
router.get('/:name', communityController.getByName);
router.patch(
  '/:name',
  requireAuth,
  validate(updateCommunitySchema),
  communityController.update,
);
router.delete('/:name', requireAuth, communityController.remove);
router.post('/:name/join', requireAuth, writeLimiter, communityController.join);
router.post('/:name/leave', requireAuth, writeLimiter, communityController.leave);

export { router as communityRoutes };
