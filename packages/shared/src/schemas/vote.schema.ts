import { z } from 'zod';

export const voteSchema = z.object({
  value: z.union([z.literal(1), z.literal(-1)]),
});

export const batchVoteSchema = z.object({
  targetType: z.enum(['post', 'comment']),
  targetIds: z.array(z.string()).min(1).max(100),
});

export type VoteInput = z.infer<typeof voteSchema>;
export type BatchVoteInput = z.infer<typeof batchVoteSchema>;
