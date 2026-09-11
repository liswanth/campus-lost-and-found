function normalizeText(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function getWords(text) {
  return [...new Set(normalizeText(text).split(' ').filter(Boolean))]
}

function calculateTextSimilarity(text1, text2) {
  const words1 = getWords(text1)
  const words2 = getWords(text2)

  if (!words1.length || !words2.length) {
    return 0
  }

  const common = words1.filter((word) => words2.includes(word)).length
  const union = new Set([...words1, ...words2]).size

  return union ? common / union : 0
}

function calculateMatchScore(lostItem, foundItem) {
  const nameSimilarity = calculateTextSimilarity(
    lostItem.itemName,
    foundItem.itemName
  )

  const categoryMatch =
    normalizeText(lostItem.category) === normalizeText(foundItem.category)
      ? 1
      : 0

  const descriptionSimilarity = calculateTextSimilarity(
    lostItem.description,
    foundItem.description
  )

  const locationSimilarity = calculateTextSimilarity(
    lostItem.location,
    foundItem.location
  )

  const score =
    nameSimilarity * 50 +
    categoryMatch * 20 +
    descriptionSimilarity * 15 +
    locationSimilarity * 15

  return Math.round(score)
}

module.exports = {
  normalizeText,
  calculateTextSimilarity,
  calculateMatchScore
}
