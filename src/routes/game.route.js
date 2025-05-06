import express from 'express';
import { placeBet, cashOut } from '../controllers/game.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/bet', authenticate, placeBet);
router.post('/cashout', authenticate, cashOut);

export default router;
