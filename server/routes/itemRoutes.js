const express = require('express')
const upload = require('../middleware/uploadMiddleware')
const authMiddleware = require('../middleware/authMiddleware')
const validate = require('../middleware/validate')
const asyncHandler = require('../utils/asyncHandler')
const { itemSchema } = require('../validators/itemValidators')
const {
  createItem,
  getItems,
  getMyReports,
  updateItem,
  deleteItem,
  markFound,
  getMatches
} = require('../controllers/itemController')

const router = express.Router()

router.get('/lost-items', asyncHandler(getItems('lost')))
router.get('/found-items', asyncHandler(getItems('found')))

router.get('/my-reports', authMiddleware, asyncHandler(getMyReports))

router.get('/lost-items/:id/matches', asyncHandler(getMatches))

router.post(
  '/lost-items',
  authMiddleware,
  upload.single('image'),
  validate(itemSchema),
  asyncHandler(createItem('lost'))
)

router.post(
  '/found-items',
  authMiddleware,
  upload.single('image'),
  validate(itemSchema),
  asyncHandler(createItem('found'))
)

router.put(
  '/lost-items/:id',
  authMiddleware,
  validate(itemSchema),
  asyncHandler(updateItem('lost'))
)

router.put(
  '/found-items/:id',
  authMiddleware,
  validate(itemSchema),
  asyncHandler(updateItem('found'))
)

router.delete(
  '/lost-items/:id',
  authMiddleware,
  asyncHandler(deleteItem('lost'))
)

router.delete(
  '/found-items/:id',
  authMiddleware,
  asyncHandler(deleteItem('found'))
)

router.put(
  '/lost-items/:id/mark-found',
  authMiddleware,
  asyncHandler(markFound)
)

module.exports = router
