const jwt = require('jsonwebtoken')

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    // Check if Authorization header exists
    if (!authHeader) {
      return res.status(401).json({
        message: 'Please login first'
      })
    }

    // Example:
    // Authorization: Bearer abc123
    const token = authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({
        message: 'Authentication token missing'
      })
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    )

    // Store logged-in user information
    req.user = decoded

    // Continue to the route
    next()

  } catch (error) {
    console.log(
      'Authentication Error:',
      error.message
    )

    return res.status(401).json({
      message: 'Invalid or expired token'
    })
  }
}

module.exports = authMiddleware