import jwt from "jsonwebtoken"

export const authenticate = (req, res, next) => {

  const token = req.cookies.token
  // console.log("🚀 ~ authenticate ~ token:", token)

  if(!token) return res.status(401).json( { status: 401, message: "Unauthorized: No token" } )

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.playerId = decoded.playerId
    next()
  } catch (err) {
    return res.status(403).json({ message: 'Invalid token' })
  }
};
