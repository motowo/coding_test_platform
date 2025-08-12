import { beforeAll, afterAll, describe, expect, it, vi } from 'vitest'
import { PrismaClient } from '@prisma/client'
import Redis from 'ioredis'
import { createApp } from '../../src/app'
import type { FastifyInstance } from 'fastify'

describe('Advanced Health Check with External Services', () => {
  let app: FastifyInstance
  let prisma: PrismaClient
  let redis: Redis

  beforeAll(async () => {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env['DATABASE_URL']
        }
      }
    })

    redis = new Redis(process.env['REDIS_URL'] || 'redis://localhost:6379')

    app = createApp({
      logger: { level: 'silent' },
      prisma,
      redis
    })
    
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
    await prisma.$disconnect()
    await redis.quit()
  })

  describe('GET /health/detailed', () => {
    it('should return detailed health status when all services are healthy', async () => {
      // このテストは現時点では失敗するはず（エンドポイントが未実装）
      const response = await app.inject({
        method: 'GET',
        url: '/health/detailed'
      })

      expect(response.statusCode).toBe(200)
      expect(response.json()).toEqual({
        status: 'healthy',
        timestamp: expect.any(String),
        version: expect.any(String),
        services: {
          database: {
            status: 'healthy',
            responseTimeMs: expect.any(Number)
          },
          redis: {
            status: 'healthy',
            responseTimeMs: expect.any(Number)
          }
        },
        uptime: expect.any(Number)
      })
    })

    it('should return unhealthy status when database is unavailable', async () => {
      // データベース接続が失敗する状況をテスト
      // 実際の実装では、接続エラー時は500を返すべき
      const mockPrisma = {
        $queryRaw: vi.fn().mockRejectedValue(new Error('Database connection failed'))
      } as unknown as PrismaClient
      
      const appWithFailingDb = createApp({
        logger: { level: 'silent' },
        prisma: mockPrisma,
        redis
      })
      
      await appWithFailingDb.ready()

      const response = await appWithFailingDb.inject({
        method: 'GET',
        url: '/health/detailed'
      })

      expect(response.statusCode).toBe(503)
      expect(response.json()).toEqual({
        status: 'unhealthy',
        timestamp: expect.any(String),
        version: expect.any(String),
        services: {
          database: {
            status: 'unhealthy',
            error: 'Database connection failed'
          },
          redis: {
            status: 'healthy',
            responseTimeMs: expect.any(Number)
          }
        }
      })

      await appWithFailingDb.close()
    })
  })

  describe('GET /health/readiness', () => {
    it('should check application readiness', async () => {
      // Readiness probe用のエンドポイント（未実装なので失敗する）
      const response = await app.inject({
        method: 'GET',
        url: '/health/readiness'
      })

      expect(response.statusCode).toBe(200)
      expect(response.json()).toEqual({
        status: 'ready',
        timestamp: expect.any(String),
        version: expect.any(String),
        checks: {
          database: 'ready',
          redis: 'ready'
        }
      })
    })
  })

  describe('GET /health/liveness', () => {
    it('should check application liveness', async () => {
      // Liveness probe用のエンドポイント（未実装なので失敗する）
      const response = await app.inject({
        method: 'GET',
        url: '/health/liveness'
      })

      expect(response.statusCode).toBe(200)
      expect(response.json()).toEqual({
        status: 'alive',
        timestamp: expect.any(String),
        version: expect.any(String),
        uptime: expect.any(Number)
      })
    })
  })
})