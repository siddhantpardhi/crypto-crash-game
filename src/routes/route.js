import express from 'express'
import gameRoutes from './game.route.js'
import walletRoutes from './wallet.route.js'
import playerRoutes from "./player.route.js"

const router = express.Router()

router.use('/player',playerRoutes)
router.use('/game', gameRoutes)
router.use('/wallet', walletRoutes);

export default router;
