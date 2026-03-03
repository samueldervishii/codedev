import mongoose, { Schema, type Document } from 'mongoose';

export interface IReport extends Document {
  _id: mongoose.Types.ObjectId;
  reporter: mongoose.Types.ObjectId;
  targetType: 'post' | 'comment';
  target: mongoose.Types.ObjectId;
  reason: string;
  community: mongoose.Types.ObjectId;
  communityName: string;
  status: 'pending' | 'resolved' | 'dismissed';
  resolvedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<IReport>(
  {
    reporter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: ['post', 'comment'], required: true },
    target: { type: Schema.Types.ObjectId, required: true },
    reason: { type: String, required: true, maxlength: 500 },
    community: { type: Schema.Types.ObjectId, ref: 'Community', required: true },
    communityName: { type: String, required: true },
    status: { type: String, enum: ['pending', 'resolved', 'dismissed'], default: 'pending' },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

reportSchema.index({ community: 1, status: 1, createdAt: -1 });

export const Report = mongoose.model<IReport>('Report', reportSchema);
