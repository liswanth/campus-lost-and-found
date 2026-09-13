const mongoose = require('mongoose')

const lostItemSchema = new mongoose.Schema(
  {
    itemName: { type: String, required: true, trim: true, maxlength: 120 },
    category: { type: String, required: true, trim: true, maxlength: 30 },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    location: { type: String, required: true, trim: true, maxlength: 200 },
    date: { type: String, required: true },
    contact: { type: String, required: true, trim: true, maxlength: 120 },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    imageUrl: { type: String, default: '', maxlength: 1000 },
    status: {
      type: String,
      enum: ['Lost', 'Found'],
      default: 'Lost',
      index: true
    }
  },
  { timestamps: true }
)

lostItemSchema.index({ createdAt: -1 })
lostItemSchema.index({ category: 1, status: 1 })

module.exports = mongoose.model('LostItem', lostItemSchema)
