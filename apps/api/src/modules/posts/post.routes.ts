import { Router } from 'express';
import { createPostSchema, updatePostSchema } from '@devhub/shared';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../auth/auth.middleware.js';
import * as postController from './post.controller.js';

const router = Router();

// Community-scoped post routes
router.post(
  '/communities/:name/posts',
  requireAuth,
  validate(createPostSchema),
  postController.create,
);
router.get('/communities/:name/posts', postController.listByCommunity);

// Global posts feed (trending, search)
router.get('/posts', postController.listAll);

// Post routes by ID
router.get('/posts/:id', postController.getById);
router.patch('/posts/:id', requireAuth, validate(updatePostSchema), postController.update);
router.delete('/posts/:id', requireAuth, postController.remove);

// Feed
router.get('/users/me/feed', requireAuth, postController.getHomeFeed);
router.get('/users/:username/posts', postController.getUserPosts);

export { router as postRoutes };
