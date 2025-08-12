import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { createApp } from '../../src/app'
import type { FastifyInstance } from 'fastify'

describe('Application Configuration', () => {
  let app: FastifyInstance

  beforeEach(async () => {
    app = createApp()
    await app.ready()
  })

  afterEach(async () => {
    await app.close()
  })

  describe('GET /api/config', () => {
    it('should return application configuration info', async () => {
      // このエンドポイントは未実装なので失敗するはず
      const response = await app.inject({
        method: 'GET',
        url: '/api/config'
      })

      expect(response.statusCode).toBe(200)
      expect(response.json()).toEqual({
        version: expect.any(String),
        environment: expect.stringMatching(/^(development|production|test)$/),
        features: {
          authentication: expect.any(Boolean),
          rateLimit: expect.any(Boolean),
          swagger: expect.any(Boolean)
        },
        limits: {
          maxRequestSize: expect.any(Number),
          requestTimeoutMs: expect.any(Number)
        }
      })
    })

    it('should not expose sensitive configuration', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/config'
      })

      const config = response.json()
      
      // センシティブな情報が含まれていないことを確認
      expect(config).not.toHaveProperty('databaseUrl')
      expect(config).not.toHaveProperty('redisUrl')
      expect(config).not.toHaveProperty('jwtSecret')
      expect(config).not.toHaveProperty('password')
      expect(config).not.toHaveProperty('secret')
    })
  })
})