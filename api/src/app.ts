import Fastify, { type FastifyInstance } from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import sensible from '@fastify/sensible'

export function createApp(): FastifyInstance {
  const app = Fastify({
    logger: {
      level: process.env['NODE_ENV'] === 'production' ? 'warn' : 'info'
    }
  })

  // Register plugins
  app.register(cors)
  app.register(helmet)
  app.register(sensible)

  // Register routes
  app.register(async function routes(fastify) {
    // Health check endpoint
    fastify.get('/health', async () => {
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: process.env['npm_package_version'] || '1.0.0'
      }
    })
  })

  return app
}