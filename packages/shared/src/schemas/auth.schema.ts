import { z } from 'zod';
import { LIMITS } from '../constants/limits.js';

export const registerSchema = z.object({
  username: z
    .string()
    .min(LIMITS.USERNAME_MIN, `Username must be at least ${LIMITS.USERNAME_MIN} characters`)
    .max(LIMITS.USERNAME_MAX, `Username must be at most ${LIMITS.USERNAME_MAX} characters`)
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(LIMITS.PASSWORD_MIN, `Password must be at least ${LIMITS.PASSWORD_MIN} characters`)
    .max(LIMITS.PASSWORD_MAX, `Password must be at most ${LIMITS.PASSWORD_MAX} characters`),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
