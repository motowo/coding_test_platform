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

  // Common response helpers
  const getAppMetadata = () => ({
    timestamp: new Date().toISOString(),
    version: process.env['npm_package_version'] || '1.0.0'
  })

  // Basic health check endpoint
  app.get('/health', async () => {
    return {
      status: 'ok',
      ...getAppMetadata()
    }
  })

  // Detailed health check with external services
  app.get('/health/detailed', async (request, reply) => {
    const metadata = getAppMetadata()
    const uptime = process.uptime()

    try {
      const services: Record<string, any> = {}
      let hasUnhealthyService = false

      // Helper function to check service health
      const checkService = async (
        name: string,
        checkFn: () => Promise<void>
      ): Promise<void> => {
        const start = Date.now()
        try {
          await checkFn()
          services[name] = {
            status: 'healthy',
            responseTimeMs: Date.now() - start
          }
        } catch (error: any) {
          services[name] = {
            status: 'unhealthy',
            error: error.message
          }
          hasUnhealthyService = true
        }
      }

      // Check database if available
      if (options.prisma) {
        await checkService('database', () => options.prisma!.$queryRaw`SELECT 1`)
      }

      // Check Redis if available
      if (options.redis) {
        await checkService('redis', () => options.redis!.ping())
      }

      const responseData = {
        status: hasUnhealthyService ? 'unhealthy' : 'healthy',
        ...metadata,
        services
      }

      if (hasUnhealthyService) {
        return reply.status(503).send(responseData)
      }

      return {
        ...responseData,
        uptime
      }
    } catch (error: any) {
      return reply.status(503).send({
        status: 'unhealthy',
        ...metadata,
        error: error.message
      })
    }
  })

  // Readiness probe endpoint
  app.get('/health/readiness', async (request, reply) => {
    const metadata = getAppMetadata()
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
        ...metadata,
        checks
      }
    } catch (error: any) {
      checks.database = 'not ready'
      checks.redis = 'not ready'
      
      return reply.status(503).send({
        status: 'not ready',
        ...metadata,
        checks
      })
    }
  })

  // Liveness probe endpoint
  app.get('/health/liveness', async () => {
    return {
      status: 'alive',
      ...getAppMetadata(),
      uptime: process.uptime()
    }
  })

  // Application configuration endpoint
  app.get('/api/config', async () => {
    const environment = process.env['NODE_ENV'] || 'development'
    
    return {
      ...getAppMetadata(),
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