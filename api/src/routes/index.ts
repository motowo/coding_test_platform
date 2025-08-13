import { FastifyInstance } from 'fastify'
import { authRoutes } from './auth'
import { userRoutes } from './users'
import { problemRoutes } from './problems'
import { assessmentRoutes } from './assessments'
import { submissionRoutes } from './submissions'
import { languageRoutes } from './languages'
import { executeRoutes } from './execute'

export async function setupRoutes(server: FastifyInstance) {
  // API prefix
  await server.register(
    async function (server) {
      // Authentication routes
      await server.register(authRoutes, { prefix: '/auth' })

      // Protected routes
      await server.register(userRoutes, { prefix: '/users' })
      await server.register(problemRoutes, { prefix: '/problems' })
      await server.register(assessmentRoutes, { prefix: '/assessments' })
      await server.register(submissionRoutes, { prefix: '/submissions' })
      await server.register(languageRoutes, { prefix: '/languages' })

      // Code execution routes (no auth required for testing)
      await server.register(executeRoutes)
    },
    { prefix: '/api/v1' }
  )

  // Root endpoint
  server.get('/', async () => {
    return {
      name: 'SkillGaug API',
      version: '1.0.0',
      description: 'RESTful API for coding assessment platform',
      documentation: '/documentation',
      health: '/health',
    }
  })
}
