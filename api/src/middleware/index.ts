import { FastifyInstance } from 'fastify'
import { config } from '../utils/config'

export async function setupMiddleware(server: FastifyInstance) {
  // Sensible plugin for common utilities including httpErrors
  await server.register(import('@fastify/sensible'))

  // CORS
  await server.register(import('@fastify/cors'), {
    origin: config.cors.origin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })

  // Rate limiting
  await server.register(import('@fastify/rate-limit'), {
    max: config.rateLimit.max,
    timeWindow: config.rateLimit.windowMs,
    allowList: config.isDevelopment ? ['127.0.0.1', 'localhost'] : [],
  })

  // JWT
  await server.register(import('@fastify/jwt'), {
    secret: config.jwt.secret,
    sign: {
      expiresIn: config.jwt.expiresIn,
    },
  })

  // Authentication decorator
  server.decorate('authenticate', async function (this: any, request: any, reply: any) {
    try {
      await request.jwtVerify()
    } catch (error) {
      reply.code(401).send({ error: 'Unauthorized' })
    }
  })
}