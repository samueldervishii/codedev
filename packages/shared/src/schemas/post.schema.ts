import { z } from 'zod';
import { LIMITS } from '../constants/limits.js';

const flairSchema = z.object({
  name: z.string().min(1).max(30),
  color: z.string().min(1).max(20),
}).optional();

const basePostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(LIMITS.POST_TITLE_MAX),
  flair: flairSchema,
});

export const createTextPostSchema = basePostSchema.extend({
  type: z.literal('text'),
  body: z.string().min(1, 'Body is required').max(LIMITS.POST_BODY_MAX),
});

export const createLinkPostSchema = basePostSchema.extend({
  type: z.literal('link'),
  url: z.string().url('Invalid URL').max(LIMITS.POST_URL_MAX),
});

export const createCodePostSchema = basePostSchema.extend({
  type: z.literal('code'),
  codeSnippet: z.object({
    code: z.string().min(1, 'Code is required').max(LIMITS.POST_CODE_MAX),
    language: z.string().min(1).max(LIMITS.POST_LANGUAGE_MAX),
    fileName: z.string().max(LIMITS.POST_FILENAME_MAX).optional(),
  }),
});

export const createPostSchema = z.discriminatedUnion('type', [
  createTextPostSchema,
  createLinkPostSchema,
  createCodePostSchema,
]);

export const updatePostSchema = z.object({
  body: z.string().max(LIMITS.POST_BODY_MAX).optional(),
});

export const crosspostSchema = z.object({
  communityName: z.string().min(1).max(30),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type CrosspostInput = z.infer<typeof crosspostSchema>;
