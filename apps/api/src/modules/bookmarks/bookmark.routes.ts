import { Router } from 'express';
import { batchBookmarkSchema } from '@devhub/shared';
import { validate } from '../../middleware/validate.js';
import { validateObjectId } from '../../middleware/validateObjectId.js';
import { writeLimiter } from '../../middleware/rateLimiter.js';
import { requireAuth } from '../auth/auth.middleware.js';
import * as bookmarkController from './bookmark.controller.js';

const router = Router();

router.post('/posts/:id/bookmark', validateObjectId('id'), requireAuth, writeLimiter, bookmarkController.addBookmark);
router.delete('/posts/:id/bookmark', validateObjectId('id'), requireAuth, bookmarkController.removeBookmark);
router.get('/users/me/bookmarks', requireAuth, bookmarkController.getUserBookmarks);
router.post('/bookmarks/batch', requireAuth, validate(batchBookmarkSchema), bookmarkController.batchGetBookmarks);

export { router as bookmarkRoutes };
