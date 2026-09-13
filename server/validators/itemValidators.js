const { z } = require('zod')

const categories = [
  'Electronics',
  'Documents',
  'Personal',
  'Books',
  'Clothing',
  'Other'
]

const dateSchema = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must use YYYY-MM-DD format')
  .refine((value) => {
    const [year, month, day] = value.split('-').map(Number)
    const date = new Date(Date.UTC(year, month - 1, day))
    return (
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day
    )
  }, {
    message: 'Date must be a valid calendar date'
  })

const itemSchema = z.object({
  itemName: z.string().trim().min(2).max(120),
  category: z.enum(categories),
  description: z.string().trim().min(5).max(1000),
  location: z.string().trim().min(2).max(200),
  date: dateSchema,
  contact: z.string().trim().min(3).max(120)
}).strict()

module.exports = { itemSchema, categories }
