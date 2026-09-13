const jwt = require('jsonwebtoken')
const AppError = require('../utils/AppError')

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication token required', 401, 'AUTH_REQUIRED'))
  }

  const token = authHeader.slice(7).trim()

  if (!token) {
    return next(new AppError('Authentication token required', 401, 'AUTH_REQUIRED'))
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    next(new AppError('Invalid or expired token', 401, 'INVALID_TOKEN'))
  }
}

module.exports = authMiddleware
