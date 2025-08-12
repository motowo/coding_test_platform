import { FastifyInstance } from 'fastify'

export async function problemRoutes(server: FastifyInstance) {
  // Placeholder for problem routes
  // Will be implemented in future iterations
  
  server.get('/', async () => {
    return {
      message: 'Problem routes - Coming soon',
      endpoints: [
        'GET /problems - List all problems',
        'GET /problems/:id - Get problem by ID',
        'POST /problems - Create new problem',
        'PUT /problems/:id - Update problem',
        'DELETE /problems/:id - Delete problem',
      ]
    }
  })
}