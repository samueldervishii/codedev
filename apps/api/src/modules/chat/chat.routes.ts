import { Router } from 'express';
import { chatMessageSchema } from '@devhub/shared';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../auth/auth.middleware.js';
import * as chatController from './chat.controller.js';

const router = Router();

// Chat streaming
router.post('/chat', requireAuth, validate(chatMessageSchema), chatController.streamMessage);

// Conversation history
router.get('/conversations', requireAuth, chatController.getConversations);
router.get('/conversations/:conversationId', requireAuth, chatController.getConversation);
router.delete('/conversations/:conversationId', requireAuth, chatController.deleteConversation);

export { router as chatRoutes };
