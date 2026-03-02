import { Conversation } from './conversation.model.js';
import { ApiError } from '../../utils/ApiError.js';

export class ConversationService {
  async saveMessages(
    conversationId: string,
    userId: string,
    userMessage: string,
    assistantMessage: string,
  ) {
    const conversation = await Conversation.findOneAndUpdate(
      { conversationId, user: userId },
      {
        $setOnInsert: {
          conversationId,
          user: userId,
          title: userMessage.slice(0, 100),
        },
        $push: {
          messages: {
            $each: [
              { role: 'user', content: userMessage, createdAt: new Date() },
              { role: 'assistant', content: assistantMessage, createdAt: new Date() },
            ],
          },
        },
      },
      { upsert: true, new: true },
    );

    return conversation;
  }

  async getUserConversations(userId: string, page: number = 1, limit: number = 20) {
    const safeLimit = Math.min(Math.max(1, limit), 50);
    const safePage = Math.max(1, page);
    const skip = (safePage - 1) * safeLimit;

    const [conversations, total] = await Promise.all([
      Conversation.find({ user: userId })
        .select('conversationId title updatedAt')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(safeLimit),
      Conversation.countDocuments({ user: userId }),
    ]);

    return { conversations, total, page: safePage, limit: safeLimit };
  }

  async getConversation(conversationId: string, userId: string) {
    const conversation = await Conversation.findOne({ conversationId, user: userId });
    if (!conversation) throw ApiError.notFound('Conversation not found');
    return conversation;
  }

  async deleteConversation(conversationId: string, userId: string) {
    const result = await Conversation.deleteOne({ conversationId, user: userId });
    if (result.deletedCount === 0) throw ApiError.notFound('Conversation not found');
  }
}

export const conversationService = new ConversationService();
