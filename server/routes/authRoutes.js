const express = require('express')
const rateLimit = require('express-rate-limit')
const validate = require('../middleware/validate')
const asyncHandler = require('../utils/asyncHandler')
const { registerSchema, loginSchema } = require('../validators/authValidators')
const { register, login } = require('../controllers/authController')

const router = express.Router()

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.',
    code: 'AUTH_RATE_LIMITED'
  }
})

router.post('/register', authLimiter, validate(registerSchema), asyncHandler(register))
router.post('/login', authLimiter, validate(loginSchema), asyncHandler(login))

module.exports = router
