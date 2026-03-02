import type { Request, Response } from 'express';
import { chatService } from './chat.service.js';
import { conversationService } from './conversation.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const streamMessage = async (req: Request, res: Response) => {
  const { messages, conversationId } = req.body;
  const userId = req.user!.userId;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  let aborted = false;
  req.on('close', () => {
    aborted = true;
  });

  try {
    const stream = chatService.createStream(messages);
    let fullContent = '';

    stream.on('text', (text) => {
      fullContent += text;
      if (!aborted) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    });

    await stream.finalMessage();

    // Save conversation to DB after successful stream
    if (conversationId && fullContent) {
      const lastUserMessage = messages[messages.length - 1];
      if (lastUserMessage?.role === 'user') {
        try {
          await conversationService.saveMessages(
            conversationId,
            userId,
            lastUserMessage.content,
            fullContent,
          );
        } catch (err: any) {
          console.error('Failed to save conversation:', err.message);
        }
      }
    }

    if (!aborted) {
      res.write('data: [DONE]\n\n');
      res.end();
    }
  } catch (error: any) {
    if (!aborted) {
      console.error('Chat stream error:', error.message);
      res.write(`data: ${JSON.stringify({ error: 'Something went wrong. Please try again later.' })}\n\n`);
      res.end();
    }
  }
};

export const getConversations = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const result = await conversationService.getUserConversations(req.user!.userId, page, limit);
  res.json({
    success: true,
    data: result.conversations,
    pagination: { page: result.page, limit: result.limit, total: result.total },
  });
});

export const getConversation = asyncHandler(async (req: Request, res: Response) => {
  const conversation = await conversationService.getConversation(
    req.params.conversationId as string,
    req.user!.userId,
  );
  res.json({ success: true, data: conversation });
});

export const deleteConversation = asyncHandler(async (req: Request, res: Response) => {
  await conversationService.deleteConversation(
    req.params.conversationId as string,
    req.user!.userId,
  );
  res.json({ success: true, data: null, message: 'Conversation deleted' });
});
