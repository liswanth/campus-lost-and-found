// Express 5 makes `req.query` a getter-only property, so any middleware that
// tries to do `req.query = cleanedObject` (like express-mongo-sanitize does)
// throws: "Cannot set property query of [object Object] which has only a getter".
//
// This middleware does the same NoSQL-injection sanitization
// (stripping keys that start with "$" or contain ".") but mutates each
// object's own properties in place, so it never reassigns req.query,
// req.body, or req.params themselves.

const isPlainObject = (value) =>
  Object.prototype.toString.call(value) === '[object Object]'

const isDangerousKey = (key) => key.startsWith('$') || key.includes('.')

function sanitizeInPlace(target) {
  if (Array.isArray(target)) {
    target.forEach((item) => sanitizeInPlace(item))
    return target
  }

  if (!isPlainObject(target)) {
    return target
  }

  for (const key of Object.keys(target)) {
    if (isDangerousKey(key)) {
      delete target[key]
      continue
    }

    const value = target[key]

    if (Array.isArray(value) || isPlainObject(value)) {
      sanitizeInPlace(value)
    }
  }

  return target
}

const sanitize = () => (req, res, next) => {
  sanitizeInPlace(req.body)
  sanitizeInPlace(req.params)
  sanitizeInPlace(req.query)

  next()
}

module.exports = sanitize
