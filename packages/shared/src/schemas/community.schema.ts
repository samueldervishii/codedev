import { z } from 'zod';
import { LIMITS } from '../constants/limits.js';

export const createCommunitySchema = z.object({
  name: z
    .string()
    .min(LIMITS.COMMUNITY_NAME_MIN)
    .max(LIMITS.COMMUNITY_NAME_MAX)
    .regex(/^[a-zA-Z0-9_]+$/, 'Community name can only contain letters, numbers, and underscores'),
  displayName: z.string().max(100).optional(),
  description: z.string().min(1).max(LIMITS.COMMUNITY_DESCRIPTION_MAX),
  tags: z.array(z.string().max(30)).max(10).optional(),
});

export const updateCommunitySchema = z.object({
  displayName: z.string().max(100).optional(),
  description: z.string().min(1).max(LIMITS.COMMUNITY_DESCRIPTION_MAX).optional(),
  rules: z
    .array(
      z.object({
        title: z.string().max(100),
        description: z.string().max(500),
      }),
    )
    .max(LIMITS.COMMUNITY_RULES_MAX)
    .optional(),
  tags: z.array(z.string().max(30)).max(10).optional(),
});

export type CreateCommunityInput = z.infer<typeof createCommunitySchema>;
export type UpdateCommunityInput = z.infer<typeof updateCommunitySchema>;
