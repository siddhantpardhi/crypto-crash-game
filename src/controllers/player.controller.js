import jwt from "jsonwebtoken"
import { Player } from "../models/player.model.js";
import bcrypt from "bcryptjs"

export const registerPlayer = async(req, res) => {
    try {
        const { username, password } = req.body
    
        const existedPlayer = await Player.findOne( { username: username.toLowerCase() } )
    
        if(existedPlayer) return res.status(401).json({ status: 401, message: "Player already exists" })
    
        const player = await Player.create({
            username: username.toLowerCase(),
            password
        })
    
        const createdPlayer = player.toObject()
        delete createdPlayer.password
    
        return res.status(201).json({status: 201, message: "Player registered successfully", data: createdPlayer })
    } catch (error) {
        console.error("Error while registering player: ", error)
        res.status(500).json({ status: 500, message: error.message })
    }
}

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const player = await Player.findOne({ username })
      
        if (!player || !(await bcrypt.compare(password, player.password))) {
          return res.status(401).json({ message: 'Invalid credentials' })
        }
        
        const origin = req.get("origin") || ""
        const islocal = origin.includes("localhost")
        console.log("🚀 ~ login ~ islocal:", islocal)
      
        const token = jwt.sign(
          { playerId: player._id },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
        );

        const options = {
            httpOnly: true,     
            secure: !islocal,   
            sameSite: islocal ? 'lax' : 'none',    
            maxAge: 3600000
          }
      
        return res
        .status(200)
        .cookie("token", token, options)
        .json({ status: 200, token })
    } catch (error) {
        console.error("Error while logging in the user: ", error)
        res.status(500).json({ status: 500, message: error.message})
        
    }
  };