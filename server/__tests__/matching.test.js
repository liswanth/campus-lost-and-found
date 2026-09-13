const {
  levenshteinDistance,
  levenshteinSimilarity,
  tokenSimilarity,
  fuzzyTextSimilarity,
  dateSimilarity,
  calculateMatchBreakdown,
  calculateMatchScore
} = require('../utils/matching')

describe('Matching algorithm', () => {
  test('Levenshtein distance detects a small typo', () => {
    expect(levenshteinDistance('iphone', 'iphon')).toBe(1)
  })

  test('Levenshtein similarity is high for a typo', () => {
    expect(levenshteinSimilarity('Black Wallet', 'Blak Wallet')).toBeGreaterThan(0.85)
  })

  test('token similarity handles word overlap', () => {
    expect(tokenSimilarity('black leather wallet', 'leather wallet')).toBeCloseTo(2 / 3)
  })

  test('fuzzy similarity combines character and token similarity', () => {
    expect(fuzzyTextSimilarity('blue backpack', 'blu backpack')).toBeGreaterThan(0.75)
  })

  test('date similarity gives full score for the same date', () => {
    expect(dateSimilarity('2026-09-10', '2026-09-10')).toBe(1)
  })

  test('empty values safely return zero', () => {
    expect(fuzzyTextSimilarity('', 'watch')).toBe(0)
    expect(dateSimilarity('', '2026-09-10')).toBe(0)
  })

  test('match breakdown uses the required weights', () => {
    const lost = {
      itemName: 'Black Casio Watch',
      category: 'Electronics',
      location: 'CSE Block',
      description: 'Black digital watch with silver strap',
      date: '2026-09-10'
    }

    const found = {
      itemName: 'Black Casio Watc',
      category: 'Electronics',
      location: 'CSE Block',
      description: 'Black digital watch with silver strap',
      date: '2026-09-10'
    }

    const breakdown = calculateMatchBreakdown(lost, found)

    expect(breakdown.overall).toBeGreaterThanOrEqual(90)
    expect(breakdown.category).toBe(100)
    expect(breakdown.name).toBeGreaterThan(70)
    expect(calculateMatchScore(lost, found)).toBe(breakdown.overall)
  })
})
