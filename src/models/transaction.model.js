import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
    type: { type: String, enum: ['BET', 'CASHOUT'], required: true },
    crypto: { type: String, trim: true },
    cryptoAmount: { type: Number, trim: true },
    usdAmount: {type: Number, trim: true },
    hash: { type: String, trim: true},
    metadata: Object
}, { timestamps: true });

export const Transaction = mongoose.model('Transaction', transactionSchema);