import rateLimit from 'express-rate-limit';

const isDev = process.env.NODE_ENV !== 'production';

export const authLimiter = rateLimit({
  windowMs: isDev ? 60 * 1000 : 15 * 60 * 1000,
  max: isDev ? 500 : 10,
  message: { success: false, message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const chatLimiter = rateLimit({
  windowMs: isDev ? 60 * 1000 : 15 * 60 * 1000,
  max: isDev ? 500 : 30,
  message: { success: false, message: 'Chat rate limit reached, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter for write operations (create post, comment, vote, bookmark, join/leave)
export const writeLimiter = rateLimit({
  windowMs: isDev ? 60 * 1000 : 15 * 60 * 1000,
  max: isDev ? 500 : 60,
  message: { success: false, message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const generalLimiter = rateLimit({
  windowMs: isDev ? 60 * 1000 : 15 * 60 * 1000,
  max: isDev ? 500 : 200,
  message: { success: false, message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});
