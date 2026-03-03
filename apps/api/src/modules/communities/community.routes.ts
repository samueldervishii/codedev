import { Router } from 'express';
import { createCommunitySchema, updateCommunitySchema } from '@devhub/shared';
import { validate } from '../../middleware/validate.js';
import { writeLimiter } from '../../middleware/rateLimiter.js';
import { requireAuth } from '../auth/auth.middleware.js';
import * as communityController from './community.controller.js';

const router = Router();

router.post('/', requireAuth, writeLimiter, validate(createCommunitySchema), communityController.create);
router.get('/', communityController.list);
router.get('/trending/top', communityController.trending);
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

// Mod tools
router.post('/:name/ban', requireAuth, communityController.banUser);
router.post('/:name/unban', requireAuth, communityController.unbanUser);
router.post('/:name/moderators', requireAuth, communityController.addModerator);
router.delete('/:name/moderators', requireAuth, communityController.removeModerator);

export { router as communityRoutes };
