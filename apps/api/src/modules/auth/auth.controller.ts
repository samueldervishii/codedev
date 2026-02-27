import type { Request, Response } from 'express';
import { authService } from './auth.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const REFRESH_TOKEN_COOKIE = 'refreshToken';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  res.cookie(REFRESH_TOKEN_COOKIE, result.refreshToken, COOKIE_OPTIONS);
  res.status(201).json({
    success: true,
    data: { user: result.user, accessToken: result.accessToken },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  res.cookie(REFRESH_TOKEN_COOKIE, result.refreshToken, COOKIE_OPTIONS);
  res.json({
    success: true,
    data: { user: result.user, accessToken: result.accessToken },
  });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies[REFRESH_TOKEN_COOKIE];
  if (!token) {
    res.status(401).json({ success: false, message: 'No refresh token' });
    return;
  }

  const result = await authService.refresh(token);
  res.cookie(REFRESH_TOKEN_COOKIE, result.refreshToken, COOKIE_OPTIONS);
  res.json({
    success: true,
    data: { user: result.user, accessToken: result.accessToken },
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  await authService.logout(req.user!.userId);
  res.clearCookie(REFRESH_TOKEN_COOKIE, { path: '/' });
  res.json({ success: true, data: null, message: 'Logged out' });
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getMe(req.user!.userId);
  res.json({ success: true, data: user });
});
