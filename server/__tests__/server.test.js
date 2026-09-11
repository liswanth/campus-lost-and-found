const request = require('supertest')
const app = require('../server')

describe('Campus Lost and Found API', () => {
  test('GET / should return API running message', async () => {
    const response = await request(app).get('/')

    expect(response.statusCode).toBe(200)
    expect(response.body.status).toBe('ok')
  })

  test('GET /api/health should return ok', async () => {
    const response = await request(app).get('/api/health')

    expect(response.statusCode).toBe(200)
    expect(response.body.status).toBe('ok')
  })

  test('Protected POST /api/lost-items should reject request without token', async () => {
    const response = await request(app).post('/api/lost-items')

    expect(response.statusCode).toBe(401)
  })

  test('Protected POST /api/found-items should reject request without token', async () => {
    const response = await request(app).post('/api/found-items')

    expect(response.statusCode).toBe(401)
  })

  test('Protected GET /api/my-reports should reject request without token', async () => {
    const response = await request(app).get('/api/my-reports')

    expect(response.statusCode).toBe(401)
  })

  test('Protected DELETE /api/lost-items/:id should reject request without token', async () => {
    const response = await request(app).delete(
      '/api/lost-items/507f1f77bcf86cd799439011'
    )

    expect(response.statusCode).toBe(401)
  })

  test('Protected DELETE /api/found-items/:id should reject request without token', async () => {
    const response = await request(app).delete(
      '/api/found-items/507f1f77bcf86cd799439011'
    )

    expect(response.statusCode).toBe(401)
  })

  test('Protected PUT /api/lost-items/:id should reject request without token', async () => {
    const response = await request(app).put(
      '/api/lost-items/507f1f77bcf86cd799439011'
    )

    expect(response.statusCode).toBe(401)
  })

  test('Protected PUT /api/found-items/:id should reject request without token', async () => {
    const response = await request(app).put(
      '/api/found-items/507f1f77bcf86cd799439011'
    )

    expect(response.statusCode).toBe(401)
  })

  test('Protected mark-found endpoint should reject request without token', async () => {
    const response = await request(app).put(
      '/api/lost-items/507f1f77bcf86cd799439011/mark-found'
    )

    expect(response.statusCode).toBe(401)
  })
})
