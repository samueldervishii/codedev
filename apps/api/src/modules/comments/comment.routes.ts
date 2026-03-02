import { Router } from 'express';
import { createCommentSchema, updateCommentSchema } from '@devhub/shared';
import { validate } from '../../middleware/validate.js';
import { validateObjectId } from '../../middleware/validateObjectId.js';
import { writeLimiter } from '../../middleware/rateLimiter.js';
import { requireAuth } from '../auth/auth.middleware.js';
import * as commentController from './comment.controller.js';

const router = Router();

// Post-scoped comment routes
router.post(
  '/posts/:postId/comments',
  validateObjectId('postId'),
  requireAuth,
  writeLimiter,
  validate(createCommentSchema),
  commentController.create,
);
router.get('/posts/:postId/comments', validateObjectId('postId'), commentController.listByPost);

// Comment routes by ID
router.patch(
  '/comments/:id',
  validateObjectId('id'),
  requireAuth,
  validate(updateCommentSchema),
  commentController.update,
);
router.delete('/comments/:id', validateObjectId('id'), requireAuth, commentController.remove);

// User comments
router.get('/users/:username/comments', commentController.getUserComments);

export { router as commentRoutes };
