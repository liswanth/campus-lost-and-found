const request = require('supertest')
const app = require('../server')

describe('Campus Lost and Found API', () => {
  test('GET / should return API running message', async () => {
    const response = await request(app).get('/')

    expect(response.statusCode).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.status).toBe('ok')
    expect(response.body.version).toBe('v1')
  })

  test('GET /api/health should return health status', async () => {
    const response = await request(app).get('/api/health')

    expect(response.statusCode).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.status).toBe('ok')
  })

  test('Unknown route should return consistent 404 JSON', async () => {
    const response = await request(app).get('/api/v1/does-not-exist')

    expect(response.statusCode).toBe(404)
    expect(response.body.success).toBe(false)
    expect(response.body.code).toBe('NOT_FOUND')
  })

  test('Register validation rejects a weak password', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: '123'
      })

    expect(response.statusCode).toBe(400)
    expect(response.body.code).toBe('VALIDATION_ERROR')
  })

  test('Login validation rejects an invalid email', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'not-an-email',
        password: 'password'
      })

    expect(response.statusCode).toBe(400)
    expect(response.body.code).toBe('VALIDATION_ERROR')
  })

  const protectedRoutes = [
    ['POST', '/api/v1/lost-items'],
    ['POST', '/api/v1/found-items'],
    ['GET', '/api/v1/my-reports'],
    ['DELETE', '/api/v1/lost-items/507f1f77bcf86cd799439011'],
    ['DELETE', '/api/v1/found-items/507f1f77bcf86cd799439011'],
    ['PUT', '/api/v1/lost-items/507f1f77bcf86cd799439011'],
    ['PUT', '/api/v1/found-items/507f1f77bcf86cd799439011'],
    ['PUT', '/api/v1/lost-items/507f1f77bcf86cd799439011/mark-found']
  ]

  test.each(protectedRoutes)('%s %s rejects request without token', async (method, path) => {
    const response = await request(app)[method.toLowerCase()](path)

    expect(response.statusCode).toBe(401)
    expect(response.body.success).toBe(false)
    expect(response.body.code).toBe('AUTH_REQUIRED')
  })
})
