const request = require('supertest')
const jwt = require('jsonwebtoken')
const app = require('../server')

describe('Campus Lost and Found API', () => {

  test('GET / should return API running message', async () => {
    const response = await request(app).get('/')

    expect(response.statusCode).toBe(200)
    expect(response.body.status).toBe('ok')
  })

  test('GET /api/health should return health status', async () => {
    const response = await request(app).get('/api/health')

    expect(response.statusCode).toBe(200)
    expect(response.body.status).toBe('ok')
    expect(response.body).toHaveProperty('database')
  })

  test('Unknown route should return 404', async () => {
    const response = await request(app)
      .get('/api/unknown-route')

    expect(response.statusCode).toBe(404)
    expect(response.body.code).toBe('NOT_FOUND')
  })

  test('Protected POST /api/v1/lost-items should reject request without token', async () => {
    const response = await request(app)
      .post('/api/v1/lost-items')

    expect(response.statusCode).toBe(401)
  })

  test('Protected POST /api/v1/found-items should reject request without token', async () => {
    const response = await request(app)
      .post('/api/v1/found-items')

    expect(response.statusCode).toBe(401)
  })

  test('Protected GET /api/v1/my-reports should reject request without token', async () => {
    const response = await request(app)
      .get('/api/v1/my-reports')

    expect(response.statusCode).toBe(401)
  })

  test('Protected DELETE /api/v1/lost-items/:id should reject request without token', async () => {
    const response = await request(app)
      .delete('/api/v1/lost-items/507f1f77bcf86cd799439011')

    expect(response.statusCode).toBe(401)
  })

  test('Protected DELETE /api/v1/found-items/:id should reject request without token', async () => {
    const response = await request(app)
      .delete('/api/v1/found-items/507f1f77bcf86cd799439011')

    expect(response.statusCode).toBe(401)
  })

  test('Protected PUT /api/v1/lost-items/:id should reject request without token', async () => {
    const response = await request(app)
      .put('/api/v1/lost-items/507f1f77bcf86cd799439011')

    expect(response.statusCode).toBe(401)
  })

  test('Protected PUT /api/v1/found-items/:id should reject request without token', async () => {
    const response = await request(app)
      .put('/api/v1/found-items/507f1f77bcf86cd799439011')

    expect(response.statusCode).toBe(401)
  })

  test('Protected mark-found endpoint should reject request without token', async () => {
    const response = await request(app)
      .put('/api/v1/lost-items/507f1f77bcf86cd799439011/mark-found')

    expect(response.statusCode).toBe(401)
  })

  test('Protected endpoint should reject invalid authorization format', async () => {
    const response = await request(app)
      .get('/api/v1/my-reports')
      .set('Authorization', 'InvalidToken')

    expect(response.statusCode).toBe(401)
    expect(response.body.message).toBe('Invalid authorization format')
  })

  test('Protected endpoint should reject authorization without token', async () => {
    const response = await request(app)
      .get('/api/v1/my-reports')
      .set('Authorization', 'Bearer')

    expect(response.statusCode).toBe(401)
  })

  test('Protected endpoint should reject invalid JWT', async () => {
    const response = await request(app)
      .get('/api/v1/my-reports')
      .set('Authorization', 'Bearer invalid-token')

    expect(response.statusCode).toBe(401)
    expect(response.body.message).toBe('Invalid or expired token')
  })

  test('Protected endpoint should reject expired JWT', async () => {
    const secret = process.env.JWT_SECRET

    const expiredToken = jwt.sign(
      {
        id: '507f1f77bcf86cd799439011',
        email: 'test@example.com'
      },
      secret,
      {
        expiresIn: -1
      }
    )

    const response = await request(app)
      .get('/api/v1/my-reports')
      .set('Authorization', `Bearer ${expiredToken}`)

    expect(response.statusCode).toBe(401)
    expect(response.body.message).toBe('Invalid or expired token')
  })

})