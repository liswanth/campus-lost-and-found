const multer = require('multer')

const errorHandler = (error, req, res, next) => {
  console.error(`[${req.method} ${req.originalUrl}]`, error)

  if (error instanceof multer.MulterError) {
    const message =
      error.code === 'LIMIT_FILE_SIZE'
        ? 'Image must be smaller than 5 MB'
        : error.message

    return res.status(400).json({
      success: false,
      message,
      code: error.code
    })
  }

  if (error.code === 'INVALID_IMAGE') {
    return res.status(400).json({
      success: false,
      message: error.message,
      code: error.code
    })
  }

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Database validation failed',
      code: 'VALIDATION_ERROR',
      details: Object.values(error.errors).map((item) => item.message)
    })
  }

  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid resource id',
      code: 'INVALID_ID'
    })
  }

  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'A record with these unique details already exists',
      code: 'DUPLICATE_RESOURCE'
    })
  }

  if (error.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      message: 'Please check the submitted fields',
      code: 'VALIDATION_ERROR',
      details: error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message
      }))
    })
  }

  const statusCode = error.statusCode || 500
  const message =
    statusCode >= 500 ? 'Internal server error' : error.message

  res.status(statusCode).json({
    success: false,
    message,
    code: error.code || 'INTERNAL_ERROR'
  })
}

module.exports = errorHandler
