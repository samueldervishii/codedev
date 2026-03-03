import mongoose, { Schema, type Document } from 'mongoose';

export interface IPost extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  type: 'text' | 'link' | 'code';
  body?: string;
  url?: string;
  codeSnippet?: {
    code: string;
    language: string;
    fileName?: string;
  };
  flair?: { name: string; color: string };
  crosspostFrom?: { postId: mongoose.Types.ObjectId; communityName: string };
  isPinned: boolean;
  isLocked: boolean;
  author: mongoose.Types.ObjectId;
  community: mongoose.Types.ObjectId;
  upvoteCount: number;
  downvoteCount: number;
  score: number;
  commentCount: number;
  hotScore: number;
  isDeleted: boolean;
  authorUsername: string;
  communityName: string;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    title: { type: String, required: true, maxlength: 300 },
    type: { type: String, enum: ['text', 'link', 'code'], required: true },
    body: { type: String, maxlength: 40000 },
    url: { type: String },
    codeSnippet: {
      code: { type: String, maxlength: 50000 },
      language: { type: String, maxlength: 50 },
      fileName: { type: String, maxlength: 200 },
    },
    flair: {
      name: { type: String, maxlength: 30 },
      color: { type: String, maxlength: 20 },
    },
    crosspostFrom: {
      postId: { type: Schema.Types.ObjectId, ref: 'Post' },
      communityName: { type: String },
    },
    isPinned: { type: Boolean, default: false },
    isLocked: { type: Boolean, default: false },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    community: { type: Schema.Types.ObjectId, ref: 'Community', required: true },
    upvoteCount: { type: Number, default: 0 },
    downvoteCount: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    hotScore: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
    authorUsername: { type: String },
    communityName: { type: String },
  },
  { timestamps: true },
);

postSchema.index({ community: 1, hotScore: -1 });
postSchema.index({ community: 1, createdAt: -1 });
postSchema.index({ community: 1, score: -1 });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ hotScore: -1 });
postSchema.index({ title: 'text', body: 'text' });

export const Post = mongoose.model<IPost>('Post', postSchema);
