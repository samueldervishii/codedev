import mongoose, { Schema, type Document } from 'mongoose';

export interface IVote extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  targetType: 'post' | 'comment';
  target: mongoose.Types.ObjectId;
  value: 1 | -1;
  createdAt: Date;
  updatedAt: Date;
}

const voteSchema = new Schema<IVote>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: ['post', 'comment'], required: true },
    target: { type: Schema.Types.ObjectId, required: true, refPath: 'targetType' },
    value: { type: Number, enum: [1, -1], required: true },
  },
  { timestamps: true },
);

// One vote per user per target
voteSchema.index({ user: 1, targetType: 1, target: 1 }, { unique: true });
voteSchema.index({ target: 1, targetType: 1 });

export const Vote = mongoose.model<IVote>('Vote', voteSchema);
