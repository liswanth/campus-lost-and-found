require('dotenv').config({ quiet: true })

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const mongoSanitize = require('./middleware/sanitize')
const mongoose = require('mongoose')

const { validateEnv } = require('./config/env')
const authRoutes = require('./routes/authRoutes')
const itemRoutes = require('./routes/itemRoutes')
const errorHandler = require('./middleware/errorHandler')

const app = express()
const config = {
  port: Number(process.env.PORT) || 5000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173'
}

const allowedOrigins = config.clientUrl
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.disable('x-powered-by')

app.use(helmet())
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true)
    }

    return callback(new Error('CORS origin is not allowed'))
  }
}))
app.use(express.json({ limit: '100kb' }))
app.use(express.urlencoded({ extended: false, limit: '100kb' }))
app.use(mongoSanitize())

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Campus Lost & Found Backend is Running!',
    status: 'ok',
    version: 'v1'
  })
})

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  })
})

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1', itemRoutes)

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    code: 'NOT_FOUND'
  })
})

app.use(errorHandler)

const startServer = async () => {
  try {
    const env = validateEnv()

    await mongoose.connect(env.mongoUri)
    console.log('MongoDB connected')

    app.listen(env.port, () => {
      console.log(`Server running on http://localhost:${env.port}`)
    })
  } catch (error) {
    console.error('Server startup failed:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  startServer()
}

module.exports = app
