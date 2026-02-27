import mongoose, { Schema, type Document } from 'mongoose';

export interface IComment extends Document {
  _id: mongoose.Types.ObjectId;
  body: string;
  author: mongoose.Types.ObjectId;
  post: mongoose.Types.ObjectId;
  parent: mongoose.Types.ObjectId | null;
  depth: number;
  upvoteCount: number;
  downvoteCount: number;
  score: number;
  isDeleted: boolean;
  authorUsername: string;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    body: { type: String, required: true, maxlength: 10000 },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    parent: { type: Schema.Types.ObjectId, ref: 'Comment', default: null },
    depth: { type: Number, default: 0 },
    upvoteCount: { type: Number, default: 0 },
    downvoteCount: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
    authorUsername: { type: String },
  },
  { timestamps: true },
);

commentSchema.index({ post: 1, parent: 1, score: -1 });
commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ author: 1, createdAt: -1 });

export const Comment = mongoose.model<IComment>('Comment', commentSchema);
