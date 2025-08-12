import { FastifyInstance } from 'fastify'
import { config } from './config'

export async function setupSwagger(server: FastifyInstance) {
  // Register Swagger
  await server.register(import('@fastify/swagger'), {
    openapi: {
      info: {
        title: 'SkillGaug API',
        description: 'RESTful API for SkillGaug coding assessment platform',
        version: '1.0.0',
        contact: {
          name: 'SkillGaug Team',
          email: 'support@skillgaug.com',
        },
        license: {
          name: 'MIT',
        },
      },
      servers: [
        {
          url: `http://localhost:${config.server.port}`,
          description: 'Development server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
      tags: [
        { name: 'Authentication', description: 'User authentication endpoints' },
        { name: 'Users', description: 'User management endpoints' },
        { name: 'Problems', description: 'Problem management endpoints' },
        { name: 'Assessments', description: 'Assessment management endpoints' },
        { name: 'Submissions', description: 'Code submission and execution endpoints' },
        { name: 'Languages', description: 'Programming language endpoints' },
      ],
    },
  })

  // Register Swagger UI
  await server.register(import('@fastify/swagger-ui'), {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
  })
}