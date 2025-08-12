import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../../src/app'
import type { FastifyInstance } from 'fastify'

describe('Health Check API', () => {
  let app: FastifyInstance

  beforeEach(async () => {
    app = createApp()
    await app.ready()
  })

  afterEach(async () => {
    await app.close()
  })

  describe('GET /health', () => {
    it('should return health status with 200', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health'
      })

      expect(response.statusCode).toBe(200)
      expect(response.json()).toEqual({
        status: 'ok',
        timestamp: expect.any(String),
        version: expect.any(String)
      })
    })

    it('should have proper response headers', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health'
      })

      expect(response.headers['content-type']).toContain('application/json')
    })
  })
})