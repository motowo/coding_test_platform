import { FastifyInstance } from 'fastify'

export async function assessmentRoutes(server: FastifyInstance) {
  // Placeholder for assessment routes
  // Will be implemented in future iterations

  server.get('/', async () => {
    return {
      message: 'Assessment routes - Coming soon',
      endpoints: [
        'GET /assessments - List all assessments',
        'GET /assessments/:id - Get assessment by ID',
        'POST /assessments - Create new assessment',
        'PUT /assessments/:id - Update assessment',
        'DELETE /assessments/:id - Delete assessment',
        'POST /assessments/:id/assign - Assign assessment to candidate',
      ],
    }
  })
}
