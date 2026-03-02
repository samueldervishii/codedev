import Anthropic from '@anthropic-ai/sdk';
import { env } from '../../config/env.js';
import type { ChatMessage } from '@devhub/shared';

const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are DevHub's AI assistant, a helpful coding companion built into the DevHub developer platform. DevHub is a Reddit-like community for developers where users share code, discuss ideas, and connect with other developers.

You help users with:
- Programming questions across all languages and frameworks
- Navigating the DevHub platform (creating posts, joining communities, using markdown)
- Code debugging, best practices, and explanations
- DevOps, system design, and software engineering concepts

Keep responses concise and developer-friendly. Use markdown formatting and code blocks when appropriate. Do not discuss topics unrelated to software development or the DevHub platform.`;

export class ChatService {
  createStream(messages: ChatMessage[]) {
    return anthropic.messages.stream({
      model: env.ANTHROPIC_MODEL,
      max_tokens: env.ANTHROPIC_MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });
  }
}

export const chatService = new ChatService();
