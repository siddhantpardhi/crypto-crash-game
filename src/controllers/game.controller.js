import { Player } from '../models/player.model.js';
import { Round } from '../models/round.model.js';
import { Transaction } from '../models/transaction.model.js';
import { getCryptoPrice } from '../utils/priceCache.js';
import crypto from 'crypto';
import { getCurrentRoundId } from '../socket/socket.js';

export const placeBet = async (req, res) => {
    try {
        const { usdAmount, cryptoType } = req.body;
        // console.log("🚀 ~ placeBet ~ cryptoType:", cryptoType)

        const playerId = req.playerId

        if (!playerId) {
            return res.status(401).json({ message: 'Unauthorized: Missing player ID' });
        }

        if (!usdAmount || isNaN(usdAmount) || usdAmount <= 0) {
            return res.status(400).json({ message: 'Invalid bet amount' });
        }

        if (!['bitcoin', 'ethereum'].includes(cryptoType)) {
            return res.status(400).json({ message: 'Invalid crypto type' });
        }

        // Convert USD to crypto
        const price = await getCryptoPrice(cryptoType);
        // console.log("🚀 ~ placeBet ~ price:", price)
        const cryptoAmount = usdAmount / price;
        // console.log("🚀 ~ placeBet ~ cryptoAmount:", cryptoAmount)

        // Deduct USD from player wallet and add crypto balance (optional)

        const updatedPlayer = await Player.findOneAndUpdate(
            {
                _id: playerId,
                $expr: { $gte: ['$wallet.usd', usdAmount] }
            },
            {
                $inc: {
                    'wallet.usd': -usdAmount,
                    [`wallet.crypto.${cryptoType}`]: cryptoAmount
                }
            },
            { new: true }
        );

        if (!updatedPlayer) {
            return res.status(400).json({ message: 'Insufficient balance or player not found' });
        }

        // Add bet to current round (TODO: fetch actual current round later)
        const roundId = getCurrentRoundId();
        // console.log("🚀 ~ placeBet ~ roundId:", roundId)

        if (!roundId) {
            return res.status(400).json({ message: 'No active round available' });
          }
          
        const betData = {
            playerId: updatedPlayer._id,
            crypto: cryptoType,
            amount: cryptoAmount,
            usdEquivalent: usdAmount,
            timestamp: new Date()
        };

        const updatedRound = await Round.findOneAndUpdate(
            { roundId },
            { $push: { bets: betData } },
            { new: true }
        );

        if (!updatedRound) {
            return res.status(404).json({ message: 'Invalid or expired round' });
        }

        // Log transaction
        const txHash = crypto.randomBytes(16).toString('hex');
        Transaction.create({
            playerId,
            type: 'BET',
            crypto: cryptoType,
            cryptoAmount,
            usdAmount,
            hash: txHash,
            metadata: { roundId }
        }).catch(error => console.error("Transaction log failed: ", error))

        return res.status(200).json({
            message: 'Bet placed successfully',
            roundId,
            cryptoAmount,
            txHash
        });
    } catch (err) {
        console.error('Bet Error:', err);
        return res.status(500).json({ message: 'Internal server error during bet' });
    }
};

export const cashOut = async (req, res) => {
    try {
        const playerId = req.playerId
        // console.log("🚀 ~ cashOut ~ playerId:", playerId)
        const roundId = getCurrentRoundId()

        if (!roundId) {
            return res.status(404).json({ message: 'No active round available' });
          }

        const round = await Round.findOne({ roundId });
        if (!round) return res.status(404).json({ message: 'Round not found' });

        const playerBet = round.bets.find(b => b.playerId.toString() === playerId);
        if (!playerBet) return res.status(400).json({ message: 'No active bet found for this player' });

        const alreadyCashedOut = round.cashouts.find(c => c.playerId.toString() === playerId);
        if (alreadyCashedOut) return res.status(400).json({ message: 'Player already cashed out in this round' });

        // TODO: Replace with real-time multiplier
        const { multiplier } = req.body

        if (!multiplier || isNaN(multiplier) || multiplier < 1) {
            return res.status(400).json({ message: 'Invalid multiplier value' });
          }
          
        // console.log("🚀 ~ cashOut ~ multiplier:", multiplier)
        const payoutCrypto = playerBet.amount * multiplier;

        // Update player's wallet (add crypto)
        const player = await Player.findByIdAndUpdate(playerId, {
            $inc: {
              [`wallet.crypto.${playerBet.crypto}`]: payoutCrypto
            }
          });

          if(!player) {
            return res.status(404).json({status:404, message: "Player does not exist"})
          }

        // Log cashout in round
        const cashoutEntry = {
            playerId,
            multiplier,
            cryptoPayout: payoutCrypto,
            usdEquivalent: payoutCrypto * (await getCryptoPrice(playerBet.crypto)),
            timestamp: new Date()
        };

        round.cashouts.push(cashoutEntry);

        // Log transaction
        const txHash = crypto.randomBytes(16).toString('hex');

        await Promise.all([
            Round.findOneAndUpdate(
                { roundId },
                { $push: { cashouts: cashoutEntry } }
              ),
            Transaction.create({
                playerId,
                type: 'CASHOUT',
                crypto: playerBet.crypto,
                cryptoAmount: payoutCrypto,
                usdAmount: cashoutEntry.usdEquivalent,
                hash: txHash,
                metadata: { roundId, multiplier }
            }).catch(error => console.error("Transaction log failed: ", error))
        ])

        return res.status(200).json({
            message: 'Cashout successful',
            payoutCrypto,
            multiplier,
            txHash
        });
    } catch (err) {
        console.error('Cashout Error:', err);
        return res.status(500).json({ message: 'Internal server error during cashout' });
    }
};