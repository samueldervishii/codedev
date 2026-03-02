import mongoose, { Schema, type Document } from 'mongoose';

export interface IChatMessage {
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

export interface IConversation extends Document {
  _id: mongoose.Types.ObjectId;
  conversationId: string;
  user: mongoose.Types.ObjectId;
  title: string;
  messages: IChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const chatMessageSchema = new Schema<IChatMessage>(
  {
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const conversationSchema = new Schema<IConversation>(
  {
    conversationId: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, default: '' },
    messages: [chatMessageSchema],
  },
  { timestamps: true },
);

conversationSchema.index({ user: 1, updatedAt: -1 });

export const Conversation = mongoose.model<IConversation>('Conversation', conversationSchema);
