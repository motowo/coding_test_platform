import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { ScoringService } from '../services/scoring-service'

// Request schema validation
const executeRequestSchema = z.object({
  language: z.string().min(1, 'Language is required'),
  code: z.string().min(1, 'Code is required'),
  input: z.string().default(''),
  timeout: z.number().optional(),
})

export async function executeRoutes(server: FastifyInstance) {
  const scoringService = new ScoringService()

  // Get supported languages
  server.get('/api/v1/execute/languages', async () => {
    const languages = scoringService.getSupportedLanguages()
    return {
      languages: languages.map((lang) => ({
        code: lang,
        name: lang.charAt(0).toUpperCase() + lang.slice(1),
      })),
    }
  })

  // Execute code endpoint
  server.post(
    '/api/v1/execute',
    {
      schema: {
        body: {
          type: 'object',
          required: ['language', 'code'],
          properties: {
            language: { type: 'string' },
            code: { type: 'string' },
            input: { type: 'string' },
            timeout: { type: 'number' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              output: { type: 'string' },
              error: { type: ['string', 'null'] },
              executionTime: { type: 'number' },
            },
          },
          400: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        // Validate request body
        const validatedBody = executeRequestSchema.parse(request.body)

        // Check if language is supported
        const supportedLanguages = scoringService.getSupportedLanguages()
        if (!supportedLanguages.includes(validatedBody.language)) {
          return reply.code(400).send({
            error: 'INVALID_LANGUAGE',
            message: `Unsupported language: ${validatedBody.language}. Supported languages: ${supportedLanguages.join(', ')}`,
          })
        }

        // Execute code
        const result = await scoringService.executeCode({
          language: validatedBody.language,
          code: validatedBody.code,
          input: validatedBody.input,
          timeout: validatedBody.timeout,
        })

        return result
      } catch (error) {
        server.log.error(error, 'Code execution failed')

        if (error instanceof z.ZodError) {
          return reply.code(400).send({
            error: 'VALIDATION_ERROR',
            message: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
          })
        }

        return reply.code(500).send({
          error: 'EXECUTION_ERROR',
          message: 'Internal server error during code execution',
        })
      }
    }
  )
}
