export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  conversationId?: string;
}

export interface ChatResponse {
  reply: string;
}

export interface ConversationSummary {
  _id: string;
  conversationId: string;
  title: string;
  updatedAt: string;
}

export interface Conversation {
  _id: string;
  conversationId: string;
  user: string;
  title: string;
  messages: (ChatMessage & { createdAt: string })[];
  createdAt: string;
  updatedAt: string;
}
