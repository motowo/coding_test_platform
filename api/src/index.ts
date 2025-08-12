import fastify from 'fastify'
import { PrismaClient } from '@prisma/client'
import Redis from 'ioredis'
import { setupSwagger } from './utils/swagger'
import { setupMiddleware } from './middleware'
import { setupRoutes } from './routes'
import { config } from './utils/config'
import { logger } from './utils/logger'

const prisma = new PrismaClient()
const redis = new Redis(config.redis.url)

const server = fastify({
  logger: {
    level: config.log.level,
    ...(config.isDevelopment && {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss.l',
          ignore: 'pid,hostname',
        },
      },
    }),
  },
})

// Register Prisma and Redis as decorators
server.decorate('prisma', prisma)
server.decorate('redis', redis)

// Type declarations for decorators
declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient
    redis: Redis
    authenticate: (request: any, reply: any) => Promise<void>
  }
}

async function start() {
  try {
    // Setup middleware
    await setupMiddleware(server)

    // Setup Swagger documentation
    await setupSwagger(server)

    // Setup routes
    await setupRoutes(server)

    // Health check endpoint
    server.get('/health', async () => {
      try {
        // Check database connection
        await prisma.$queryRaw`SELECT 1`
        
        // Check Redis connection
        await redis.ping()

        return { 
          status: 'healthy',
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          services: {
            database: 'healthy',
            redis: 'healthy'
          }
        }
      } catch (error) {
        server.log.error(error, 'Health check failed')
        throw new Error('Service unhealthy')
      }
    })

    // Start server
    await server.listen({ 
      host: config.server.host, 
      port: config.server.port 
    })

    logger.info(`🚀 Server ready at http://${config.server.host}:${config.server.port}`)
    logger.info(`📚 Swagger UI available at http://${config.server.host}:${config.server.port}/documentation`)

  } catch (error) {
    logger.error(error, 'Failed to start server')
    process.exit(1)
  }
}

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}, shutting down gracefully`)
  
  try {
    await server.close()
    await prisma.$disconnect()
    await redis.quit()
    logger.info('Server shut down successfully')
    process.exit(0)
  } catch (error) {
    logger.error(error, 'Error during shutdown')
    process.exit(1)
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// Handle unhandled rejections and exceptions
process.on('unhandledRejection', (reason, promise) => {
  logger.error({ reason, promise }, 'Unhandled Rejection')
})

process.on('uncaughtException', (error) => {
  logger.error(error, 'Uncaught Exception')
  process.exit(1)
})

// Start the server
start()