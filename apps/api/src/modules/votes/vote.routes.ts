import { Router } from 'express';
import { voteSchema, batchVoteSchema } from '@devhub/shared';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../auth/auth.middleware.js';
import * as voteController from './vote.controller.js';

const router = Router();

// Post votes
router.post('/posts/:id/vote', requireAuth, validate(voteSchema), voteController.voteOnPost);
router.delete('/posts/:id/vote', requireAuth, voteController.removePostVote);
router.get('/posts/:id/vote', requireAuth, voteController.getUserVoteOnPost);

// Comment votes
router.post(
  '/comments/:id/vote',
  requireAuth,
  validate(voteSchema),
  voteController.voteOnComment,
);
router.delete('/comments/:id/vote', requireAuth, voteController.removeCommentVote);

// Batch
router.post('/votes/batch', requireAuth, validate(batchVoteSchema), voteController.batchGetVotes);

export { router as voteRoutes };
