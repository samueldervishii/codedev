import { Router } from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { validateObjectId } from '../../middleware/validateObjectId.js';
import * as notificationController from './notification.controller.js';

const router = Router();

router.get('/', requireAuth, notificationController.list);
router.get('/unread-count', requireAuth, notificationController.unreadCount);
router.patch('/:id/read', validateObjectId('id'), requireAuth, notificationController.markRead);
router.patch('/read-all', requireAuth, notificationController.markAllRead);

export { router as notificationRoutes };
