require('dotenv').config()

const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const LostItem = require('./models/LostItem')
const FoundItem = require('./models/FoundItem')
const User = require('./models/User')
const authMiddleware = require('./middleware/authMiddleware')
const upload = require('./middleware/uploadMiddleware')
const cloudinary = require('./cloudinary')
const { calculateMatchScore } = require('./utils/matching')

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173'
}))
app.use(express.json())

app.get('/', (req, res) => {
  res.json({
    message: 'Campus Lost & Found Backend is Running!',
    status: 'ok'
  })
})

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.post('/api/auth/register', async (req, res) => {
  try {
    const name = String(req.body.name || '').trim()
    const email = String(req.body.email || '').trim().toLowerCase()
    const password = String(req.body.password || '')

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please fill all fields' })
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters'
      })
    }

    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    })

    res.status(201).json({
      message: 'Registration successful!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    })
  } catch (error) {
    console.error('Register Error:', error)
    res.status(500).json({ message: 'Registration failed' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase()
    const password = String(req.body.password || '')

    if (!email || !password) {
      return res.status(400).json({
        message: 'Please enter email and password'
      })
    }

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password'
      })
    }

    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      return res.status(401).json({
        message: 'Invalid email or password'
      })
    }

    const secret = process.env.JWT_SECRET

    if (!secret) {
      return res.status(500).json({
        message: 'JWT_SECRET is not configured on the server'
      })
    }

    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email
      },
      secret,
      { expiresIn: '7d' }
    )

    res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    })
  } catch (error) {
    console.error('Login Error:', error)
    res.status(500).json({ message: 'Login failed' })
  }
})

app.get('/api/lost-items', async (req, res) => {
  try {
    const lostItems = await LostItem.find()
      .sort({ createdAt: -1 })

    res.json(lostItems)
  } catch (error) {
    console.error('Get Lost Items Error:', error)
    res.status(500).json({ message: 'Failed to get lost items' })
  }
})

app.get('/api/found-items', async (req, res) => {
  try {
    const foundItems = await FoundItem.find()
      .sort({ createdAt: -1 })

    res.json(foundItems)
  } catch (error) {
    console.error('Get Found Items Error:', error)
    res.status(500).json({ message: 'Failed to get found items' })
  }
})

const uploadImage = async (file) => {
  if (!file) return ''

  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    throw new Error('Cloudinary is not configured')
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'campus-lost-and-found',
        resource_type: 'image'
      },
      (error, result) => {
        if (error) {
          reject(error)
        } else {
          resolve(result.secure_url)
        }
      }
    )

    stream.end(file.buffer)
  })
}

app.post(
  '/api/lost-items',
  authMiddleware,
  upload.single('image'),
  async (req, res) => {
    try {
      const required = [
        'itemName',
        'category',
        'description',
        'location',
        'date',
        'contact'
      ]

      const missing = required.find(
        (field) => !String(req.body[field] || '').trim()
      )

      if (missing) {
        return res.status(400).json({
          message: `Please provide ${missing}`
        })
      }

      const imageUrl = await uploadImage(req.file)

      const lostItem = await LostItem.create({
        itemName: req.body.itemName,
        category: req.body.category,
        description: req.body.description,
        location: req.body.location,
        date: req.body.date,
        contact: req.body.contact,
        userId: req.user.id,
        imageUrl,
        status: 'Lost'
      })

      res.status(201).json({
        message: 'Lost item saved successfully!',
        item: lostItem
      })
    } catch (error) {
      console.error('Create Lost Item Error:', error)
      res.status(500).json({
        message: error.message || 'Failed to save lost item'
      })
    }
  }
)

app.post(
  '/api/found-items',
  authMiddleware,
  upload.single('image'),
  async (req, res) => {
    try {
      const required = [
        'itemName',
        'category',
        'description',
        'location',
        'date',
        'contact'
      ]

      const missing = required.find(
        (field) => !String(req.body[field] || '').trim()
      )

      if (missing) {
        return res.status(400).json({
          message: `Please provide ${missing}`
        })
      }

      const imageUrl = await uploadImage(req.file)

      const foundItem = await FoundItem.create({
        itemName: req.body.itemName,
        category: req.body.category,
        description: req.body.description,
        location: req.body.location,
        date: req.body.date,
        contact: req.body.contact,
        userId: req.user.id,
        imageUrl
      })

      res.status(201).json({
        message: 'Found item saved successfully!',
        item: foundItem
      })
    } catch (error) {
      console.error('Create Found Item Error:', error)
      res.status(500).json({
        message: error.message || 'Failed to save found item'
      })
    }
  }
)

app.get('/api/my-reports', authMiddleware, async (req, res) => {
  try {
    const [lostItems, foundItems] = await Promise.all([
      LostItem.find({ userId: req.user.id }).sort({ createdAt: -1 }),
      FoundItem.find({ userId: req.user.id }).sort({ createdAt: -1 })
    ])

    res.json({ lostItems, foundItems })
  } catch (error) {
    console.error('My Reports Error:', error)
    res.status(500).json({ message: 'Failed to get your reports' })
  }
})

app.get('/api/lost-items/:id/matches', async (req, res) => {
  try {
    const lostItem = await LostItem.findById(req.params.id)

    if (!lostItem) {
      return res.status(404).json({
        message: 'Lost item not found'
      })
    }

    const foundItems = await FoundItem.find()

    const matches = foundItems
      .map((foundItem) => ({
        item: foundItem,
        matchScore: calculateMatchScore(lostItem, foundItem)
      }))
      .filter((match) => match.matchScore >= 30)
      .sort((a, b) => b.matchScore - a.matchScore)

    res.json({
      lostItem,
      matches
    })
  } catch (error) {
    console.error('Matching Error:', error)

    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid item id' })
    }

    res.status(500).json({ message: 'Failed to find matches' })
  }
})

app.delete('/api/lost-items/:id', authMiddleware, async (req, res) => {
  try {
    const item = await LostItem.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    })

    if (!item) {
      return res.status(404).json({
        message: 'Lost item not found or you are not the owner'
      })
    }

    res.json({ message: 'Lost item deleted successfully!' })
  } catch (error) {
    console.error('Delete Lost Item Error:', error)
    res.status(500).json({ message: 'Failed to delete lost item' })
  }
})

app.delete('/api/found-items/:id', authMiddleware, async (req, res) => {
  try {
    const item = await FoundItem.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    })

    if (!item) {
      return res.status(404).json({
        message: 'Found item not found or you are not the owner'
      })
    }

    res.json({ message: 'Found item deleted successfully!' })
  } catch (error) {
    console.error('Delete Found Item Error:', error)
    res.status(500).json({ message: 'Failed to delete found item' })
  }
})

const updateFields = (body) => ({
  itemName: body.itemName,
  category: body.category,
  description: body.description,
  location: body.location,
  date: body.date,
  contact: body.contact
})

app.put('/api/lost-items/:id', authMiddleware, async (req, res) => {
  try {
    const updatedItem = await LostItem.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.id
      },
      updateFields(req.body),
      {
        new: true,
        runValidators: true
      }
    )

    if (!updatedItem) {
      return res.status(404).json({
        message: 'Lost item not found or you are not the owner'
      })
    }

    res.json({
      message: 'Lost item updated successfully!',
      item: updatedItem
    })
  } catch (error) {
    console.error('Update Lost Item Error:', error)
    res.status(500).json({ message: 'Failed to update lost item' })
  }
})

app.put('/api/found-items/:id', authMiddleware, async (req, res) => {
  try {
    const updatedItem = await FoundItem.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.id
      },
      updateFields(req.body),
      {
        new: true,
        runValidators: true
      }
    )

    if (!updatedItem) {
      return res.status(404).json({
        message: 'Found item not found or you are not the owner'
      })
    }

    res.json({
      message: 'Found item updated successfully!',
      item: updatedItem
    })
  } catch (error) {
    console.error('Update Found Item Error:', error)
    res.status(500).json({ message: 'Failed to update found item' })
  }
})

app.put(
  '/api/lost-items/:id/mark-found',
  authMiddleware,
  async (req, res) => {
    try {
      const updatedItem = await LostItem.findOneAndUpdate(
        {
          _id: req.params.id,
          userId: req.user.id
        },
        { status: 'Found' },
        { new: true, runValidators: true }
      )

      if (!updatedItem) {
        return res.status(404).json({
          message: 'Lost item not found or you are not the owner'
        })
      }

      res.json({
        message: 'Item marked as found successfully!',
        item: updatedItem
      })
    } catch (error) {
      console.error('Mark Found Error:', error)
      res.status(500).json({
        message: 'Failed to mark item as found'
      })
    }
  }
)

app.use((error, req, res, next) => {
  if (error instanceof require('multer').MulterError) {
    return res.status(400).json({
      message: error.code === 'LIMIT_FILE_SIZE'
        ? 'Image must be smaller than 5 MB'
        : error.message
    })
  }

  if (error) {
    return res.status(400).json({
      message: error.message || 'Request failed'
    })
  }

  next()
})

const startServer = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not configured')
    }

    await mongoose.connect(process.env.MONGO_URI)
    console.log('MongoDB connected')

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  startServer()
}

module.exports = app
