// src/socket/index.js

import { calculateCrashPoint, generateHash } from '../utils/crashPoint.js';
import { Round } from '../models/round.model.js';

let currentMultiplier = 1.0;
let currentRound = null;
let gameInterval = null;

export const getCurrentMultiplier = () => currentMultiplier;
export const getCurrentRoundId = () => currentRound?.roundId;

export const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    if (currentRound) {
      // Send the current round state so client can catch up
      socket.emit('roundStart', {
        roundId: currentRound.roundId,
        crashPoint: currentRound.crashPoint
      });

      socket.emit('multiplier', currentMultiplier);
      console.log(`📤 Sent roundStart and multiplier to ${socket.id}`);
    } else {
      console.log(`📥 No active round for ${socket.id}`);
    }
  });

  startGameLoop(io);
};

function startGameLoop(io) {
  const TICK_RATE = 100; // ms
  const GROWTH_RATE = 1; // represents 0.01x per tick (in integer form)
  const LOG_FLUSH_INTERVAL = 20
  let currentMultiplierInt = 100; // 1.00x
  let tickCounter = 0
  let logBuffer = []
  // let gameInterval;


  const startNewRound = async () => {
    const roundId = `round-${Date.now()}`;
    const seed = `secret:${roundId}`;
    const crashPoint = calculateCrashPoint(seed); // float value like 2.57

   try {
     await Round.create({
       roundId,
       startTime: new Date(),
       crashPoint,
       multiplierLog: [],
       seed,
       hash: generateHash(seed),
       bets: [],
       cashouts: []
     });
   } catch (error) {
    console.error("Error while creating round: ", error)
   }

    currentRound = { roundId, crashPoint };
    currentMultiplierInt = 100; // reset to 1.00x

    console.log(`🔁 Emitting roundStart: roundId=${roundId}, crashPoint=${crashPoint}`);
    io.emit('roundStart', { roundId, crashPoint });
    console.log('✅ roundStart emitted to all clients');

    gameInterval = setInterval(async () => {
      currentMultiplierInt += GROWTH_RATE;
      currentMultiplier = currentMultiplierInt / 100; // convert to float for use

      // console.log("🚀 ~ Tick multiplier:", currentMultiplier);
      io.emit('multiplier', currentMultiplier);

      logBuffer.push({ time: new Date(), multiplier: currentMultiplier });
      tickCounter++

      if (tickCounter % LOG_FLUSH_INTERVAL === 0) { // every 2 seconds
        try {
          await Round.findOneAndUpdate({ roundId }, { $push: { multiplierLog: { $each: logBuffer } } });
          logBuffer = [];
        } catch (error) {
          console.error("Error while updating Round: ", error)
        }
      }

      if (currentMultiplier >= crashPoint) {
        console.log(`💥 Game crashed at ${currentMultiplier}x (>= crash point ${crashPoint})`);

        clearInterval(gameInterval);
        io.emit('crash', { roundId, crashPoint });
        currentRound = null;

        setTimeout(() => startNewRound(io), 5000); // wait 5s before next round
      }
    }, TICK_RATE);
  };

  startNewRound(io);
}

