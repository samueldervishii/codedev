import mongoose, { Schema, type Document } from 'mongoose';

export interface ICommunity extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  displayName: string;
  description: string;
  rules: { title: string; description: string }[];
  flairs: { name: string; color: string }[];
  iconUrl: string;
  bannerUrl: string;
  creator: mongoose.Types.ObjectId;
  moderators: mongoose.Types.ObjectId[];
  bannedUsers: mongoose.Types.ObjectId[];
  memberCount: number;
  postCount: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const communitySchema = new Schema<ICommunity>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      maxlength: 30,
      match: /^[a-zA-Z0-9_]+$/,
    },
    displayName: { type: String, maxlength: 100, default: '' },
    description: { type: String, required: true, maxlength: 2000 },
    rules: [
      {
        title: { type: String, maxlength: 100 },
        description: { type: String, maxlength: 500 },
      },
    ],
    iconUrl: { type: String, default: '' },
    bannerUrl: { type: String, default: '' },
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    moderators: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    bannedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    memberCount: { type: Number, default: 0 },
    postCount: { type: Number, default: 0 },
    tags: [{ type: String, maxlength: 30 }],
    flairs: [
      {
        name: { type: String, maxlength: 30 },
        color: { type: String, maxlength: 20, default: '#7c3aed' },
      },
    ],
  },
  { timestamps: true },
);

// name index already created by `unique: true`
communitySchema.index({ memberCount: -1 });
communitySchema.index({ tags: 1 });
communitySchema.index({ name: 'text', description: 'text' });

export const Community = mongoose.model<ICommunity>('Community', communitySchema);
