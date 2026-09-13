const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 160,
      unique: true,
      index: true
    },
    password: { type: String, required: true }
  },
  { timestamps: true }
)

module.exports = mongoose.model('User', userSchema)
