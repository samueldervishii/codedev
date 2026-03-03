import { Router } from 'express';
import { validateObjectId } from '../../middleware/validateObjectId.js';
import { writeLimiter } from '../../middleware/rateLimiter.js';
import { requireAuth } from '../auth/auth.middleware.js';
import * as reportController from './report.controller.js';

const router = Router();

// Report content
router.post('/posts/:id/report', validateObjectId('id'), requireAuth, writeLimiter, reportController.reportPost);
router.post('/comments/:id/report', validateObjectId('id'), requireAuth, writeLimiter, reportController.reportComment);

// Mod: view + resolve reports
router.get('/communities/:name/reports', requireAuth, reportController.listByCommunity);
router.patch('/reports/:id', validateObjectId('id'), requireAuth, reportController.resolve);

export { router as reportRoutes };
