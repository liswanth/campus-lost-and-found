const cloudinary = require('../cloudinary')
const AppError = require('../utils/AppError')

const isValidImageBuffer = (buffer) => {
  if (!buffer || buffer.length < 12) return false

  const jpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff
  const png =
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  const gif =
    buffer.toString('ascii', 0, 6) === 'GIF87a' ||
    buffer.toString('ascii', 0, 6) === 'GIF89a'
  const webp =
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'

  return jpeg || png || gif || webp
}

const uploadImage = async (file) => {
  if (!file) return ''

  if (!isValidImageBuffer(file.buffer)) {
    throw new AppError(
      'The uploaded file is not a valid image',
      400,
      'INVALID_IMAGE'
    )
  }

  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    throw new AppError(
      'Image upload service is not configured',
      500,
      'IMAGE_SERVICE_NOT_CONFIGURED'
    )
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'campus-lost-and-found',
        resource_type: 'image'
      },
      (error, result) => {
        if (error) {
          reject(new AppError('Image upload failed', 502, 'IMAGE_UPLOAD_FAILED'))
        } else {
          resolve(result.secure_url)
        }
      }
    )

    stream.end(file.buffer)
  })
}

module.exports = { uploadImage, isValidImageBuffer }
