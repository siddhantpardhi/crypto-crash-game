import mongoose from "mongoose"
import { Player } from '../models/player.model.js';

export const getWallet = async (req, res) => {
  try {
    const playerId = req.playerId;

    if (!mongoose.Types.ObjectId.isValid(playerId)) {
      return res.status(400).json({ message: 'Invalid player ID' });
    }

    // console.log("🚀 ~ getWal ~ playerId:", playerId)
    
    const player = await Player.findById(playerId).select("wallet")
    if (!player) return res.status(404).json({ message: 'Player not found' });

    return res.status(200).json({ wallet: player.wallet });
  } catch (err) {
    console.error("Error while fetching wallet: ", err)
    return res.status(500).json({ message: 'Error fetching wallet' })
  }
};
