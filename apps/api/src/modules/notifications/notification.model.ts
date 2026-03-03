import mongoose, { Schema, type Document } from 'mongoose';

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  type: 'comment_reply' | 'post_comment' | 'upvote' | 'mention';
  message: string;
  link: string;
  read: boolean;
  actor: mongoose.Types.ObjectId;
  actorUsername: string;
  relatedPost?: mongoose.Types.ObjectId;
  relatedComment?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['comment_reply', 'post_comment', 'upvote', 'mention'],
      required: true,
    },
    message: { type: String, required: true, maxlength: 500 },
    link: { type: String, required: true },
    read: { type: Boolean, default: false },
    actor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    actorUsername: { type: String, required: true },
    relatedPost: { type: Schema.Types.ObjectId, ref: 'Post' },
    relatedComment: { type: Schema.Types.ObjectId, ref: 'Comment' },
  },
  { timestamps: true },
);

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });
notificationSchema.index({ user: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
