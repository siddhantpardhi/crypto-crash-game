import express from 'express';
import { getWallet } from '../controllers/wallet.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/show', authenticate, getWallet);

export default router;
