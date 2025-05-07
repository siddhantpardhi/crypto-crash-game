# 🧨 Crypto Crash Game (Backend)

A real-time multiplayer **Crash game** where players bet in USD and win based on a live multiplier. The game is powered by real-time **crypto price integration** (BTC/ETH), a **provably fair crash algorithm**, and **Socket.IO** for real-time multiplayer gameplay.

---

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/siddhantpardhi/crypto-crash-game.git
cd crypto-crash-game
```

### 2. Install Dependencies

```
npm install
```

### 3. Environment Variables

Create a .env file in the root directory and add the following:
```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
CRYPTO_API_URL=https://api.coingecko.com/api/v3/simple/price
JWT_SECRET=
CORS_ORIGIN =
NODE_ENV=
```

### 4. Start the Server

``` bash
npm run start
```

### 5. Register User

``` bash
POST localhost:${PORT}/api/player/register
body: { 
"username": "your-username",
"password": "your-password"
}
CURL COMMAND
curl -X POST http://localhost:3000/api/player/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "your-username",
    "password": "your-password"
  }'
```

### 6. Start the Applicaton

On your browser hit, localhost:${PORT}/ \
A Login Page will open up
Login your user, it will redirect you to your game page
And from that page you can start placing bet, cashing out, checking your wallet, etc
