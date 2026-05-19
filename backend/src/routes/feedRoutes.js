import { Router } from 'express';
import { createFeed, getFeeds } from '../controllers/feedController.js';
import { validateBody } from '../middleware/validate.js';
import { createFeedSchema } from '../validators/feedValidator.js';

const router = Router();

router.get('/', getFeeds);
router.post('/', validateBody(createFeedSchema), createFeed);

export default router;
