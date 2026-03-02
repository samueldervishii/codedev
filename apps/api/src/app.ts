import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { authLimiter, chatLimiter, generalLimiter } from './middleware/rateLimiter.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { userRoutes } from './modules/users/user.routes.js';
import { communityRoutes } from './modules/communities/community.routes.js';
import { postRoutes } from './modules/posts/post.routes.js';
import { commentRoutes } from './modules/comments/comment.routes.js';
import { voteRoutes } from './modules/votes/vote.routes.js';
import { chatRoutes } from './modules/chat/chat.routes.js';
import { bookmarkRoutes } from './modules/bookmarks/bookmark.routes.js';

const app = express();

// Security
app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(generalLimiter);

// Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check
app.get('/api/v1/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

// Routes
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/communities', communityRoutes);
app.use('/api/v1', postRoutes); // Mounted at root because routes have mixed prefixes
app.use('/api/v1', commentRoutes);
app.use('/api/v1', voteRoutes);
app.use('/api/v1', chatLimiter, chatRoutes);
app.use('/api/v1', bookmarkRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export { app };
