import mongoose, { Schema, type Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  passwordHash: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  karma: number;
  postKarma: number;
  commentKarma: number;
  joinedCommunities: mongoose.Types.ObjectId[];
  refreshTokenHash: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      maxlength: 30,
      match: /^[a-zA-Z0-9_]+$/,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    displayName: { type: String, maxlength: 50, default: '' },
    bio: { type: String, maxlength: 500, default: '' },
    avatarUrl: { type: String, default: '' },
    karma: { type: Number, default: 0 },
    postKarma: { type: Number, default: 0 },
    commentKarma: { type: Number, default: 0 },
    joinedCommunities: [{ type: Schema.Types.ObjectId, ref: 'Community' }],
    refreshTokenHash: { type: String, select: false },
  },
  { timestamps: true },
);

// username and email indexes already created by `unique: true`
userSchema.index({ karma: -1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.passwordHash);
};

export const User = mongoose.model<IUser>('User', userSchema);
