import { z } from 'zod';
import { LIMITS } from '../constants/limits.js';

export const updateProfileSchema = z.object({
  displayName: z.string().max(LIMITS.DISPLAY_NAME_MAX).optional(),
  bio: z.string().max(LIMITS.BIO_MAX).optional(),
  avatarUrl: z.string().url().or(z.literal('')).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(LIMITS.PASSWORD_MIN).max(LIMITS.PASSWORD_MAX),
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
