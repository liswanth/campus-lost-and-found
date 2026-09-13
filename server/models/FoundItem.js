const mongoose = require('mongoose')

const foundItemSchema = new mongoose.Schema(
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
    imageUrl: { type: String, default: '', maxlength: 1000 }
  },
  { timestamps: true }
)

foundItemSchema.index({ createdAt: -1 })
foundItemSchema.index({ category: 1 })

module.exports = mongoose.model('FoundItem', foundItemSchema)
