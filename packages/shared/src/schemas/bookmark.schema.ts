import { z } from 'zod';

export const batchBookmarkSchema = z.object({
  postIds: z.array(z.string()).min(1).max(100),
});

export type BatchBookmarkInput = z.infer<typeof batchBookmarkSchema>;
