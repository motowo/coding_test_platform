import { FastifyInstance } from 'fastify'

export async function submissionRoutes(server: FastifyInstance) {
  // Placeholder for submission routes
  // Will be implemented in future iterations

  server.get('/', async () => {
    return {
      message: 'Submission routes - Coming soon',
      endpoints: [
        'GET /submissions - List submissions',
        'GET /submissions/:id - Get submission by ID',
        'POST /submissions - Submit code for evaluation',
        'POST /execute - Execute code with custom input',
      ],
    }
  })
}
