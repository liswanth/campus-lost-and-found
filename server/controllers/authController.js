const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const AppError = require('../utils/AppError')

const register = async (req, res) => {
  const { name, email, password } = req.body

  const existingUser = await User.findOne({ email })
  if (existingUser) {
    throw new AppError('User already exists', 409, 'USER_EXISTS')
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  const user = await User.create({
    name,
    email,
    password: hashedPassword
  })

  res.status(201).json({
    success: true,
    message: 'Registration successful!',
    user: {
      id: user._id,
      name: user.name,
      email: user.email
    }
  })
}

const login = async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email })

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS')
  }

  if (!process.env.JWT_SECRET) {
    throw new AppError('Authentication service is not configured', 500, 'AUTH_CONFIG_ERROR')
  }

  const token = jwt.sign(
    { id: user._id.toString(), email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  )

  res.json({
    success: true,
    message: 'Login successful!',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email
    }
  })
}

module.exports = { register, login }
