// server.js
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from "./database/database.js"
import { fileURLToPath } from 'url';
import path from 'path';
import routes from './routes/route.js';
import { initializeSocket } from './socket/socket.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});
const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || []
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    console.log('Incoming request from origin:', origin)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed for this origin'))
    }
  },
  credentials: true
}));
app.use(express.json({ limit: "16kb" }))
app.use(cookieParser())
app.use('/api', routes)
app.use(express.static(path.join(__dirname, "..", 'public')))

// WebSocket setup
initializeSocket(io);

// MongoDB Connection
connectDB()
  .then(data => {
    console.log(`MongoDB Connected DB HOST ${data.connection.host}`)

    app.on("error", (error) => {
      console.log("Error: ", error);
      throw error

    })

    // Start server
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`))

  })
  .catch(err => console.log(`Error while connecting to MongoDB ${err}`))

  app.use((req, res) => {
    res.status(404).send('Route not found')
  })