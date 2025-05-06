import mongoose from 'mongoose';

const roundSchema = new mongoose.Schema({
    roundId: {
        type: String,
        required: true,
        unique: true
    },
    startTime: { 
        type: Date, 
        required: true 
    },
    crashPoint: { 
        type: Number, 
        required: true 
    },
    multiplierLog: [{ 
        time: Date, 
        multiplier: Number 
    }],
    bets: [{
        playerId: mongoose.Schema.Types.ObjectId,
        crypto: String,
        amount: Number,
        usdEquivalent: Number
    }],
    cashouts: [{
        playerId: mongoose.Schema.Types.ObjectId,
        multiplier: Number,
        cryptoPayout: Number,
        usdEquivalent: Number
    }],
    seed: String,
    hash: String
}, { timestamps: true });

export const Round = mongoose.model("Round", roundSchema)