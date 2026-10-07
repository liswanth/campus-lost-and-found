const {
  normalizeText,
  calculateTextSimilarity,
  calculateMatchScore
} = require('../utils/matching')

describe('Matching Utility', () => {
  test('should normalize text correctly', () => {
    expect(normalizeText('  Black-Samsung Phone!  '))
      .toBe('black samsung phone')
  })

  test('should return high similarity for similar text', () => {
    const score = calculateTextSimilarity(
      'black samsung phone',
      'black samsung phone'
    )

    expect(score).toBe(1)
  })

  test('should return zero similarity for empty text', () => {
    expect(calculateTextSimilarity('', 'phone')).toBe(0)
  })

  test('should give a high score for the same item', () => {
    const lostItem = {
      itemName: 'Black Samsung Phone',
      category: 'Electronics',
      description: 'Black Samsung mobile phone with black cover',
      location: 'College Library',
      date: '2026-09-01'
    }

    const foundItem = {
      itemName: 'Black Samsung Phone',
      category: 'Electronics',
      description: 'Black Samsung mobile phone with black cover',
      location: 'College Library',
      date: '2026-09-01'
    }

    const score = calculateMatchScore(lostItem, foundItem)

    expect(score).toBeGreaterThanOrEqual(90)
  })

  test('should give a reasonable score for a similar item', () => {
    const lostItem = {
      itemName: 'Black Samsung Mobile',
      category: 'Electronics',
      description: 'Black Samsung mobile phone',
      location: 'College Library',
      date: '2026-09-01'
    }

    const foundItem = {
      itemName: 'Black Samsung Phone',
      category: 'Electronics',
      description: 'Samsung black mobile',
      location: 'Library',
      date: '2026-09-02'
    }

    const score = calculateMatchScore(lostItem, foundItem)

    expect(score).toBeGreaterThanOrEqual(60)
  })

  test('should give a lower score for completely different items', () => {
    const lostItem = {
      itemName: 'Black Samsung Phone',
      category: 'Electronics',
      description: 'Black mobile phone',
      location: 'College Library',
      date: '2026-09-01'
    }

    const foundItem = {
      itemName: 'Blue Water Bottle',
      category: 'Accessories',
      description: 'Blue plastic bottle',
      location: 'College Ground',
      date: '2026-09-20'
    }

    const score = calculateMatchScore(lostItem, foundItem)

    expect(score).toBeLessThan(40)
  })

  test('should give higher score when category matches', () => {
    const lostItem = {
      itemName: 'Phone',
      category: 'Electronics',
      description: 'Black phone',
      location: 'Library',
      date: '2026-09-01'
    }

    const foundSameCategory = {
      itemName: 'Phone',
      category: 'Electronics',
      description: 'Black phone',
      location: 'Library',
      date: '2026-09-01'
    }

    const foundDifferentCategory = {
      itemName: 'Phone',
      category: 'Accessories',
      description: 'Black phone',
      location: 'Library',
      date: '2026-09-01'
    }

    const sameCategoryScore = calculateMatchScore(
      lostItem,
      foundSameCategory
    )

    const differentCategoryScore = calculateMatchScore(
      lostItem,
      foundDifferentCategory
    )

    expect(sameCategoryScore).toBeGreaterThan(
      differentCategoryScore
    )
  })

  test('should give higher score when dates are close', () => {
    const lostItem = {
      itemName: 'Black Bag',
      category: 'Bags',
      description: 'Black college bag',
      location: 'Library',
      date: '2026-09-01'
    }

    const nearbyDateItem = {
      itemName: 'Black Bag',
      category: 'Bags',
      description: 'Black college bag',
      location: 'Library',
      date: '2026-09-02'
    }

    const farDateItem = {
      itemName: 'Black Bag',
      category: 'Bags',
      description: 'Black college bag',
      location: 'Library',
      date: '2026-10-01'
    }

    const nearbyScore = calculateMatchScore(
      lostItem,
      nearbyDateItem
    )

    const farScore = calculateMatchScore(
      lostItem,
      farDateItem
    )

    expect(nearbyScore).toBeGreaterThan(farScore)
  })
})