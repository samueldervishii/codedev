import { Router } from 'express';
import { voteSchema, batchVoteSchema } from '@devhub/shared';
import { validate } from '../../middleware/validate.js';
import { validateObjectId } from '../../middleware/validateObjectId.js';
import { writeLimiter } from '../../middleware/rateLimiter.js';
import { requireAuth } from '../auth/auth.middleware.js';
import * as voteController from './vote.controller.js';

const router = Router();

// Post votes
router.post('/posts/:id/vote', validateObjectId('id'), requireAuth, writeLimiter, validate(voteSchema), voteController.voteOnPost);
router.delete('/posts/:id/vote', validateObjectId('id'), requireAuth, voteController.removePostVote);
router.get('/posts/:id/vote', validateObjectId('id'), requireAuth, voteController.getUserVoteOnPost);

// Comment votes
router.post(
  '/comments/:id/vote',
  validateObjectId('id'),
  requireAuth,
  writeLimiter,
  validate(voteSchema),
  voteController.voteOnComment,
);
router.delete('/comments/:id/vote', validateObjectId('id'), requireAuth, voteController.removeCommentVote);

// Batch
router.post('/votes/batch', requireAuth, validate(batchVoteSchema), voteController.batchGetVotes);

export { router as voteRoutes };
