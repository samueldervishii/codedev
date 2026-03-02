import { z } from 'zod';

const chatMessageItemSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(4000),
});

export const chatMessageSchema = z.object({
  messages: z.array(chatMessageItemSchema).min(1).max(50),
  conversationId: z.string().min(1).max(100).optional(),
});

export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
