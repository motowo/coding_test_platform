import { FastifyInstance } from 'fastify'

export async function languageRoutes(server: FastifyInstance) {
  // Get all supported languages
  server.get('/', {
    schema: {
      tags: ['Languages'],
      summary: 'Get all supported programming languages',
      response: {
        200: {
          type: 'object',
          properties: {
            languages: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  name: { type: 'string' },
                  version: { type: 'string' },
                  dockerImage: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  }, async () => {
    const languages = await server.prisma.language.findMany({
      select: {
        id: true,
        name: true,
        version: true,
        dockerImage: true,
      },
      orderBy: { name: 'asc' },
    })

    return { languages }
  })

  // Get language by ID
  server.get('/:id', {
    schema: {
      tags: ['Languages'],
      summary: 'Get language by ID',
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'number' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            name: { type: 'string' },
            version: { type: 'string' },
            dockerImage: { type: 'string' },
          },
        },
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    const languageId = parseInt((request.params as any).id)

    const language = await server.prisma.language.findUnique({
      where: { id: languageId },
      select: {
        id: true,
        name: true,
        version: true,
        dockerImage: true,
      },
    })

    if (!language) {
      return reply.code(404).send({ error: 'Language not found' })
    }

    return language
  })
}