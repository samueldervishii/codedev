import { z } from 'zod';
import { LIMITS } from '../constants/limits.js';

export const createCommentSchema = z.object({
  body: z.string().min(1, 'Comment cannot be empty').max(LIMITS.COMMENT_BODY_MAX),
  parentId: z.string().optional(),
});

export const updateCommentSchema = z.object({
  body: z.string().min(1).max(LIMITS.COMMENT_BODY_MAX),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
