import Fastify, { type FastifyInstance } from 'fastify'
import { PrismaClient } from '@prisma/client'
import Redis from 'ioredis'

export interface AppOptions {
  logger?: {
    level: string
  }
  prisma?: PrismaClient
  redis?: Redis
}

export function createApp(options: AppOptions = {}): FastifyInstance {
  const app = Fastify({
    logger: options.logger || {
      level: process.env['NODE_ENV'] === 'production' ? 'warn' : 'info'
    }
  })

  // Conditionally decorate with external services
  if (options.prisma) {
    app.decorate('prisma', options.prisma)
  }
  if (options.redis) {
    app.decorate('redis', options.redis)
  }

  // Basic health check endpoint
  app.get('/health', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env['npm_package_version'] || '1.0.0'
    }
  })

  // Detailed health check with external services
  app.get('/health/detailed', async (request, reply) => {
    const startTime = Date.now()
    const timestamp = new Date().toISOString()
    const version = process.env['npm_package_version'] || '1.0.0'
    const uptime = process.uptime()

    try {
      const services: any = {}
      let hasUnhealthyService = false

      // Check database if available
      if (options.prisma) {
        const dbStart = Date.now()
        try {
          await options.prisma.$queryRaw`SELECT 1`
          services.database = {
            status: 'healthy',
            responseTimeMs: Date.now() - dbStart
          }
        } catch (error: any) {
          services.database = {
            status: 'unhealthy',
            error: error.message
          }
          hasUnhealthyService = true
        }
      }

      // Check Redis if available
      if (options.redis) {
        const redisStart = Date.now()
        try {
          await options.redis.ping()
          services.redis = {
            status: 'healthy',
            responseTimeMs: Date.now() - redisStart
          }
        } catch (error: any) {
          services.redis = {
            status: 'unhealthy',
            error: error.message
          }
          hasUnhealthyService = true
        }
      }

      // Return unhealthy status if any service is unhealthy
      if (hasUnhealthyService) {
        return reply.status(503).send({
          status: 'unhealthy',
          timestamp,
          version,
          services
        })
      }

      return {
        status: 'healthy',
        timestamp,
        version,
        services,
        uptime
      }
    } catch (error: any) {
      return reply.status(503).send({
        status: 'unhealthy',
        timestamp,
        version,
        error: error.message
      })
    }
  })

  // Readiness probe endpoint
  app.get('/health/readiness', async (request, reply) => {
    const timestamp = new Date().toISOString()
    const checks: any = {}

    try {
      // Check database readiness
      if (options.prisma) {
        await options.prisma.$queryRaw`SELECT 1`
        checks.database = 'ready'
      }

      // Check Redis readiness
      if (options.redis) {
        await options.redis.ping()
        checks.redis = 'ready'
      }

      return {
        status: 'ready',
        timestamp,
        checks
      }
    } catch (error: any) {
      checks.database = 'not ready'
      checks.redis = 'not ready'
      
      return reply.status(503).send({
        status: 'not ready',
        timestamp,
        checks
      })
    }
  })

  // Liveness probe endpoint
  app.get('/health/liveness', async () => {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    }
  })

  // Application configuration endpoint
  app.get('/api/config', async () => {
    const environment = process.env['NODE_ENV'] || 'development'
    
    return {
      version: process.env['npm_package_version'] || '1.0.0',
      environment,
      features: {
        authentication: false, // Not implemented yet
        rateLimit: false,      // Not implemented yet  
        swagger: false         // Not implemented yet
      },
      limits: {
        maxRequestSize: 1048576,  // 1MB
        requestTimeoutMs: 30000   // 30 seconds
      }
    }
  })

  return app
}