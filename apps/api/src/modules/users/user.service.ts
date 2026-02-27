import bcrypt from 'bcryptjs';
import { User } from './user.model.js';
import { ApiError } from '../../utils/ApiError.js';
import type { UpdateProfileInput, ChangePasswordInput } from '@devhub/shared';

export class UserService {
  async getProfile(username: string) {
    const user = await User.findOne({ username }).select(
      'username displayName bio avatarUrl karma postKarma commentKarma createdAt',
    );
    if (!user) throw ApiError.notFound('User not found');
    return user;
  }

  async updateProfile(userId: string, input: UpdateProfileInput) {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: input },
      { new: true, runValidators: true },
    ).populate('joinedCommunities', 'name displayName iconUrl');
    if (!user) throw ApiError.notFound('User not found');
    return user;
  }

  async changePassword(userId: string, input: ChangePasswordInput) {
    const user = await User.findById(userId).select('+passwordHash');
    if (!user) throw ApiError.notFound('User not found');

    const isMatch = await bcrypt.compare(input.currentPassword, user.passwordHash);
    if (!isMatch) throw ApiError.badRequest('Current password is incorrect');

    user.passwordHash = input.newPassword; // pre-save hook will hash
    await user.save();
  }
}

export const userService = new UserService();
