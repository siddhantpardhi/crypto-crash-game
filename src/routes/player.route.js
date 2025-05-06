import express from "express"
import { registerPlayer,login } from "../controllers/player.controller.js"

const router = express.Router()

router.use("/register", registerPlayer)
router.use("/login", login)

export default router