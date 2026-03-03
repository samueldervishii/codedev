import { Router } from 'express';
import { createPostSchema, updatePostSchema, crosspostSchema } from '@devhub/shared';
import { validate } from '../../middleware/validate.js';
import { validateObjectId } from '../../middleware/validateObjectId.js';
import { writeLimiter } from '../../middleware/rateLimiter.js';
import { requireAuth } from '../auth/auth.middleware.js';
import * as postController from './post.controller.js';

const router = Router();

// Community-scoped post routes
router.post(
  '/communities/:name/posts',
  requireAuth,
  writeLimiter,
  validate(createPostSchema),
  postController.create,
);
router.get('/communities/:name/posts', postController.listByCommunity);

// Global posts feed (trending, search)
router.get('/posts', postController.listAll);

// Post routes by ID
router.get('/posts/:id', validateObjectId('id'), postController.getById);
router.patch('/posts/:id', validateObjectId('id'), requireAuth, validate(updatePostSchema), postController.update);
router.delete('/posts/:id', validateObjectId('id'), requireAuth, postController.remove);
router.post('/posts/:id/crosspost', validateObjectId('id'), requireAuth, writeLimiter, validate(crosspostSchema), postController.crosspost);
router.patch('/posts/:id/pin', validateObjectId('id'), requireAuth, postController.togglePin);
router.patch('/posts/:id/lock', validateObjectId('id'), requireAuth, postController.toggleLock);

// Feed
router.get('/users/me/feed', requireAuth, postController.getHomeFeed);
router.get('/users/:username/posts', postController.getUserPosts);

export { router as postRoutes };
