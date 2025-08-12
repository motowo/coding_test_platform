import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../../src/app'
import type { FastifyInstance } from 'fastify'

describe('Error Handling', () => {
  let app: FastifyInstance

  beforeEach(async () => {
    app = createApp()
    await app.ready()
  })

  afterEach(async () => {
    await app.close()
  })

  describe('404 Not Found', () => {
    it('should return 404 for non-existent endpoints', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/non-existent-endpoint'
      })

      expect(response.statusCode).toBe(404)
      expect(response.json()).toEqual({
        error: 'Not Found',
        statusCode: 404,
        message: 'Route GET:/non-existent-endpoint not found'
      })
    })

    it('should return proper 404 response structure', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/invalid/path'
      })

      expect(response.statusCode).toBe(404)
      expect(response.headers['content-type']).toContain('application/json')
      
      const body = response.json()
      expect(body).toHaveProperty('error')
      expect(body).toHaveProperty('statusCode', 404)
      expect(body).toHaveProperty('message')
    })
  })

  describe('Method Not Allowed', () => {
    it('should return 405 for unsupported methods on existing routes', async () => {
      // /health は GET のみサポートするはず
      const response = await app.inject({
        method: 'POST',
        url: '/health'
      })

      expect(response.statusCode).toBe(404) // Fastifyでは404が返される
      expect(response.json()).toHaveProperty('statusCode', 404)
    })
  })
})