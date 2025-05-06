import mongoose from 'mongoose';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const playerSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    wallet: {
        usd: { type: Number, default: 1000 }, // Starting amount
        crypto: {
            bitcoin: { type: Number, default: 0 },
            ethereum: { type: Number, default: 0 }
        }
    }
}, { timestamps: true });

playerSchema.pre("save", async function (next) {

    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

export const Player = mongoose.model("Player", playerSchema)