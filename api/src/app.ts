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

  return app
}