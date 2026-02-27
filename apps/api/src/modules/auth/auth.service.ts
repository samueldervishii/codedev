import bcrypt from 'bcryptjs';
import { User } from '../users/user.model.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt.js';
import { ApiError } from '../../utils/ApiError.js';
import type { RegisterInput, LoginInput } from '@devhub/shared';

export class AuthService {
  async register(input: RegisterInput) {
    const existingUser = await User.findOne({
      $or: [{ email: input.email }, { username: input.username }],
    });

    if (existingUser) {
      if (existingUser.email === input.email) {
        throw ApiError.conflict('Email already registered');
      }
      throw ApiError.conflict('Username already taken');
    }

    const user = await User.create({
      username: input.username,
      email: input.email,
      passwordHash: input.password, // pre-save hook will hash
    });

    const tokenPayload = { userId: user._id.toString(), username: user.username };
    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    // Store hashed refresh token
    user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await user.save();

    // Populate for frontend sidebar
    await user.populate('joinedCommunities', 'name displayName iconUrl');

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  async login(input: LoginInput) {
    const user = await User.findOne({ email: input.email }).select('+passwordHash');

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const isMatch = await user.comparePassword(input.password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const tokenPayload = { userId: user._id.toString(), username: user.username };
    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await user.save();

    // Populate for frontend sidebar
    await user.populate('joinedCommunities', 'name displayName iconUrl');

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshToken: string) {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw ApiError.unauthorized('Invalid refresh token');
    }

    const user = await User.findById(payload.userId).select('+refreshTokenHash');
    if (!user || !user.refreshTokenHash) {
      throw ApiError.unauthorized('Invalid refresh token');
    }

    const isValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!isValid) {
      throw ApiError.unauthorized('Invalid refresh token');
    }

    // Rotate tokens
    const tokenPayload = { userId: user._id.toString(), username: user.username };
    const newAccessToken = signAccessToken(tokenPayload);
    const newRefreshToken = signRefreshToken(tokenPayload);

    user.refreshTokenHash = await bcrypt.hash(newRefreshToken, 10);
    await user.save();

    // Populate for frontend sidebar
    await user.populate('joinedCommunities', 'name displayName iconUrl');

    return {
      user: this.sanitizeUser(user),
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(userId: string) {
    await User.findByIdAndUpdate(userId, { refreshTokenHash: '' });
  }

  async getMe(userId: string) {
    const user = await User.findById(userId).populate('joinedCommunities', 'name displayName iconUrl');
    if (!user) throw ApiError.notFound('User not found');
    return this.sanitizeUser(user);
  }

  private sanitizeUser(user: any) {
    const obj = user.toObject ? user.toObject() : user;
    delete obj.passwordHash;
    delete obj.refreshTokenHash;
    delete obj.__v;
    return obj;
  }
}

export const authService = new AuthService();
