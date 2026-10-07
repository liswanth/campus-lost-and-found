function normalizeText(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function getWords(text) {
  return [
    ...new Set(
      normalizeText(text)
        .split(' ')
        .filter(Boolean)
    )
  ]
}

// Common words that do not help much in matching
const STOP_WORDS = new Set([
  'the',
  'a',
  'an',
  'and',
  'or',
  'is',
  'my',
  'with',
  'has',
  'have',
  'in',
  'on',
  'at',
  'to',
  'of'
])

function getUsefulWords(text) {
  return getWords(text).filter((word) => !STOP_WORDS.has(word))
}

// Basic Jaccard similarity
function calculateTextSimilarity(text1, text2) {
  const words1 = getUsefulWords(text1)
  const words2 = getUsefulWords(text2)

  if (!words1.length || !words2.length) {
    return 0
  }

  const common = words1.filter((word) => words2.includes(word)).length
  const union = new Set([...words1, ...words2]).size

  return union ? common / union : 0
}

// Check whether one word is close to another word
function calculateWordSimilarity(word1, word2) {
  if (!word1 || !word2) {
    return 0
  }

  if (word1 === word2) {
    return 1
  }

  // One word contains the other
  if (word1.length >= 4 && word2.length >= 4) {
    if (word1.includes(word2) || word2.includes(word1)) {
      return 0.8
    }
  }

  // Small spelling differences
  const maxLength = Math.max(word1.length, word2.length)

  if (maxLength < 4) {
    return 0
  }

  let differences = 0
  const minLength = Math.min(word1.length, word2.length)

  for (let i = 0; i < minLength; i++) {
    if (word1[i] !== word2[i]) {
      differences++
    }
  }

  differences += Math.abs(word1.length - word2.length)

  const similarity = 1 - differences / maxLength

  return similarity >= 0.7 ? similarity : 0
}

// Improved text matching
function calculateImprovedTextSimilarity(text1, text2) {
  const words1 = getUsefulWords(text1)
  const words2 = getUsefulWords(text2)

  if (!words1.length || !words2.length) {
    return 0
  }

  let totalScore = 0

  for (const word1 of words1) {
    let bestScore = 0

    for (const word2 of words2) {
      const score = calculateWordSimilarity(word1, word2)

      if (score > bestScore) {
        bestScore = score
      }
    }

    totalScore += bestScore
  }

  return totalScore / words1.length
}

function calculateCategoryMatch(lostItem, foundItem) {
  const category1 = normalizeText(lostItem.category)
  const category2 = normalizeText(foundItem.category)

  if (!category1 || !category2) {
    return 0
  }

  return category1 === category2 ? 1 : 0
}

function calculateLocationMatch(lostItem, foundItem) {
  const location1 = normalizeText(lostItem.location)
  const location2 = normalizeText(foundItem.location)

  if (!location1 || !location2) {
    return 0
  }

  if (location1 === location2) {
    return 1
  }

  return calculateImprovedTextSimilarity(location1, location2)
}

function calculateDateMatch(lostItem, foundItem) {
  if (!lostItem.date || !foundItem.date) {
    return 0
  }

  const lostDate = new Date(lostItem.date)
  const foundDate = new Date(foundItem.date)

  if (Number.isNaN(lostDate.getTime()) || Number.isNaN(foundDate.getTime())) {
    return 0
  }

  const difference = Math.abs(
    lostDate.getTime() - foundDate.getTime()
  )

  const days = difference / (1000 * 60 * 60 * 24)

  if (days <= 1) {
    return 1
  }

  if (days <= 3) {
    return 0.8
  }

  if (days <= 7) {
    return 0.5
  }

  if (days <= 30) {
    return 0.2
  }

  return 0
}

function calculateMatchScore(lostItem, foundItem) {
  const nameSimilarity = calculateImprovedTextSimilarity(
    lostItem.itemName,
    foundItem.itemName
  )

  const categoryMatch = calculateCategoryMatch(
    lostItem,
    foundItem
  )

  const descriptionSimilarity = calculateImprovedTextSimilarity(
    lostItem.description,
    foundItem.description
  )

  const locationSimilarity = calculateLocationMatch(
    lostItem,
    foundItem
  )

  const dateMatch = calculateDateMatch(
    lostItem,
    foundItem
  )

  const score =
    nameSimilarity * 45 +
    categoryMatch * 20 +
    descriptionSimilarity * 15 +
    locationSimilarity * 15 +
    dateMatch * 5

  return Math.round(Math.min(score, 100))
}

module.exports = {
  normalizeText,
  calculateTextSimilarity,
  calculateMatchScore
}