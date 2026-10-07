const jwt = require('jsonwebtoken')

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return res.status(401).json({
        message: 'Please login first'
      })
    }

    const parts = authHeader.trim().split(/\s+/)

    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
      return res.status(401).json({
        message: 'Invalid authorization format'
      })
    }

    const token = parts[1]

    if (!token) {
      return res.status(401).json({
        message: 'Authentication token missing'
      })
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not configured')

      return res.status(500).json({
        message: 'Authentication service is not configured'
      })
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    )

    req.user = decoded

    next()
  } catch (error) {
    console.log('Authentication Error:', error.message)

    return res.status(401).json({
      message: 'Invalid or expired token'
    })
  }
}

module.exports = authMiddleware