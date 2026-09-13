const mongoose = require('mongoose')
const LostItem = require('../models/LostItem')
const FoundItem = require('../models/FoundItem')
const AppError = require('../utils/AppError')
const { uploadImage } = require('../services/imageService')
const { calculateMatchBreakdown } = require('../utils/matching')

const getModel = (type) => (type === 'lost' ? LostItem : FoundItem)

const createItem = (type) => async (req, res) => {
  const Model = getModel(type)
  const imageUrl = await uploadImage(req.file)

  const item = await Model.create({
    ...req.body,
    userId: req.user.id,
    imageUrl,
    ...(type === 'lost' ? { status: 'Lost' } : {})
  })

  res.status(201).json({
    success: true,
    message: `${type === 'lost' ? 'Lost' : 'Found'} item saved successfully!`,
    item
  })
}

const getItems = (type) => async (req, res) => {
  const Model = getModel(type)
  const items = await Model.find().sort({ createdAt: -1 })

  res.json({
    success: true,
    items
  })
}

const getMyReports = async (req, res) => {
  const [lostItems, foundItems] = await Promise.all([
    LostItem.find({ userId: req.user.id }).sort({ createdAt: -1 }),
    FoundItem.find({ userId: req.user.id }).sort({ createdAt: -1 })
  ])

  res.json({ success: true, lostItems, foundItems })
}

const updateItem = (type) => async (req, res) => {
  const Model = getModel(type)

  const updatedItem = await Model.findOneAndUpdate(
    {
      _id: req.params.id,
      userId: req.user.id
    },
    req.body,
    {
      new: true,
      runValidators: true
    }
  )

  if (!updatedItem) {
    throw new AppError(
      `${type === 'lost' ? 'Lost' : 'Found'} item not found or you are not the owner`,
      404,
      'ITEM_NOT_FOUND'
    )
  }

  res.json({
    success: true,
    message: `${type === 'lost' ? 'Lost' : 'Found'} item updated successfully!`,
    item: updatedItem
  })
}

const deleteItem = (type) => async (req, res) => {
  const Model = getModel(type)

  const item = await Model.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.id
  })

  if (!item) {
    throw new AppError(
      `${type === 'lost' ? 'Lost' : 'Found'} item not found or you are not the owner`,
      404,
      'ITEM_NOT_FOUND'
    )
  }

  res.json({
    success: true,
    message: `${type === 'lost' ? 'Lost' : 'Found'} item deleted successfully!`
  })
}

const markFound = async (req, res) => {
  const item = await LostItem.findOneAndUpdate(
    {
      _id: req.params.id,
      userId: req.user.id
    },
    { status: 'Found' },
    { new: true, runValidators: true }
  )

  if (!item) {
    throw new AppError(
      'Lost item not found or you are not the owner',
      404,
      'ITEM_NOT_FOUND'
    )
  }

  res.json({
    success: true,
    message: 'Item marked as found successfully!',
    item
  })
}

const getMatches = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new AppError('Invalid item id', 400, 'INVALID_ID')
  }

  const lostItem = await LostItem.findById(req.params.id)

  if (!lostItem) {
    throw new AppError('Lost item not found', 404, 'ITEM_NOT_FOUND')
  }

  const foundItems = await FoundItem.find()

  const matches = foundItems
    .map((foundItem) => {
      const breakdown = calculateMatchBreakdown(lostItem, foundItem)

      return {
        item: foundItem,
        matchScore: breakdown.overall,
        breakdown: {
          name: breakdown.name,
          category: breakdown.category,
          location: breakdown.location,
          description: breakdown.description,
          date: breakdown.date
        },
        weights: {
          name: 40,
          category: 20,
          location: 15,
          description: 15,
          date: 10
        }
      }
    })
    .filter((match) => match.matchScore >= 30)
    .sort((a, b) => b.matchScore - a.matchScore)

  res.json({
    success: true,
    lostItem,
    matches
  })
}

module.exports = {
  createItem,
  getItems,
  getMyReports,
  updateItem,
  deleteItem,
  markFound,
  getMatches
}
