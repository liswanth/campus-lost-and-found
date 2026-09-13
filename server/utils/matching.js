function normalizeText(text) {
  return String(text || '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function levenshteinDistance(a, b) {
  const left = normalizeText(a)
  const right = normalizeText(b)

  if (!left) return right.length
  if (!right) return left.length

  const previous = Array.from({ length: right.length + 1 }, (_, i) => i)

  for (let i = 1; i <= left.length; i += 1) {
    const current = [i]

    for (let j = 1; j <= right.length; j += 1) {
      const insertion = current[j - 1] + 1
      const deletion = previous[j] + 1
      const substitution =
        previous[j - 1] + (left[i - 1] === right[j - 1] ? 0 : 1)

      current[j] = Math.min(insertion, deletion, substitution)
    }

    for (let j = 0; j < current.length; j += 1) {
      previous[j] = current[j]
    }
  }

  return previous[right.length]
}

function levenshteinSimilarity(text1, text2) {
  const a = normalizeText(text1)
  const b = normalizeText(text2)

  if (!a || !b) return 0
  if (a === b) return 1

  const maxLength = Math.max(a.length, b.length)
  return Math.max(0, 1 - levenshteinDistance(a, b) / maxLength)
}

function getWords(text) {
  return [...new Set(normalizeText(text).split(' ').filter(Boolean))]
}

function tokenSimilarity(text1, text2) {
  const words1 = getWords(text1)
  const words2 = getWords(text2)

  if (!words1.length || !words2.length) return 0

  const set2 = new Set(words2)
  const common = words1.filter((word) => set2.has(word)).length
  const union = new Set([...words1, ...words2]).size

  return union ? common / union : 0
}

function fuzzyTextSimilarity(text1, text2) {
  const characterScore = levenshteinSimilarity(text1, text2)
  const tokenScore = tokenSimilarity(text1, text2)

  // Character-level similarity carries more weight than exact word overlap.
  // This matters for near-identical phrases with a single typo (e.g.
  // "blue backpack" vs "blu backpack"): the word "blue"/"blu" never counts
  // as an overlapping token under strict Jaccard token matching, which was
  // dragging otherwise-obvious matches down. 75/25 keeps that case correctly
  // high while still rewarding genuine word overlap between longer phrases.
  return characterScore * 0.75 + tokenScore * 0.25
}

function dateSimilarity(date1, date2) {
  if (!date1 || !date2) return 0

  const first = Date.parse(`${date1}T00:00:00Z`)
  const second = Date.parse(`${date2}T00:00:00Z`)

  if (Number.isNaN(first) || Number.isNaN(second)) return 0

  const days = Math.abs(first - second) / 86400000
  return Math.max(0, 1 - days / 30)
}

function calculateMatchBreakdown(lostItem, foundItem) {
  const name = fuzzyTextSimilarity(lostItem.itemName, foundItem.itemName)
  const category =
    normalizeText(lostItem.category) === normalizeText(foundItem.category)
      ? 1
      : 0
  const location = fuzzyTextSimilarity(lostItem.location, foundItem.location)
  const description = fuzzyTextSimilarity(
    lostItem.description,
    foundItem.description
  )
  const date = dateSimilarity(lostItem.date, foundItem.date)

  const weights = {
    name: 40,
    category: 20,
    location: 15,
    description: 15,
    date: 10
  }

  const weighted = {
    name: name * weights.name,
    category: category * weights.category,
    location: location * weights.location,
    description: description * weights.description,
    date: date * weights.date
  }

  return {
    name: Math.round(name * 100),
    category: Math.round(category * 100),
    location: Math.round(location * 100),
    description: Math.round(description * 100),
    date: Math.round(date * 100),
    weighted,
    overall: Math.round(
      weighted.name +
      weighted.category +
      weighted.location +
      weighted.description +
      weighted.date
    )
  }
}

function calculateMatchScore(lostItem, foundItem) {
  return calculateMatchBreakdown(lostItem, foundItem).overall
}

module.exports = {
  normalizeText,
  levenshteinDistance,
  levenshteinSimilarity,
  tokenSimilarity,
  fuzzyTextSimilarity,
  dateSimilarity,
  calculateMatchBreakdown,
  calculateMatchScore
}
