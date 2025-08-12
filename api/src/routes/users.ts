import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { UserRole } from '@prisma/client'

const getUsersQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  role: z.nativeEnum(UserRole).optional(),
  search: z.string().optional(),
})

export async function userRoutes(server: FastifyInstance) {
  // Get all users (admin/recruiter only)
  server.get('/', {
    preHandler: [server.authenticate],
    schema: {
      tags: ['Users'],
      summary: 'Get all users',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', minimum: 1, default: 1 },
          limit: { type: 'number', minimum: 1, maximum: 100, default: 10 },
          role: { type: 'string', enum: ['CANDIDATE', 'RECRUITER', 'CREATOR', 'ADMIN'] },
          search: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            users: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  name: { type: 'string' },
                  email: { type: 'string' },
                  role: { type: 'string' },
                  createdAt: { type: 'string', format: 'date-time' },
                },
              },
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'number' },
                limit: { type: 'number' },
                total: { type: 'number' },
                pages: { type: 'number' },
              },
            },
          },
        },
        401: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
        403: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    const currentUser = (request as any).user

    // Check permissions
    if (currentUser.role !== UserRole.ADMIN && currentUser.role !== UserRole.RECRUITER) {
      return reply.code(403).send({ error: 'Insufficient permissions' })
    }

    try {
      const { page, limit, role, search } = getUsersQuerySchema.parse(request.query)
      const skip = (page - 1) * limit

      const where: any = {}
      if (role) {
        where.role = role
      }
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ]
      }

      const [users, total] = await Promise.all([
        server.prisma.user.findMany({
          where,
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        server.prisma.user.count({ where }),
      ])

      return {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      }
    } catch (error) {
      server.log.error(error)
      return reply.code(400).send({ error: 'Invalid query parameters' })
    }
  })

  // Get user by ID
  server.get('/:id', {
    preHandler: [server.authenticate],
    schema: {
      tags: ['Users'],
      summary: 'Get user by ID',
      security: [{ bearerAuth: [] }],
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
            email: { type: 'string' },
            role: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        401: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
        403: {
          type: 'object',
          properties: {
            error: { type: 'string' },
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
    const currentUser = (request as any).user
    const userId = parseInt((request.params as any).id)

    // Users can view their own profile, admins and recruiters can view any profile
    if (
      currentUser.id !== userId &&
      currentUser.role !== UserRole.ADMIN &&
      currentUser.role !== UserRole.RECRUITER
    ) {
      return reply.code(403).send({ error: 'Insufficient permissions' })
    }

    const user = await server.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return reply.code(404).send({ error: 'User not found' })
    }

    return user
  })

  // Update user profile
  server.patch('/:id', {
    preHandler: [server.authenticate],
    schema: {
      tags: ['Users'],
      summary: 'Update user profile',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'number' },
        },
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 255 },
          email: { type: 'string', format: 'email' },
          role: { type: 'string', enum: ['CANDIDATE', 'RECRUITER', 'CREATOR', 'ADMIN'] },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                name: { type: 'string' },
                email: { type: 'string' },
                role: { type: 'string' },
                updatedAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
        401: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
        403: {
          type: 'object',
          properties: {
            error: { type: 'string' },
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
    const currentUser = (request as any).user
    const userId = parseInt((request.params as any).id)
    const updateData = request.body as any

    // Users can update their own profile, admins can update any profile
    if (currentUser.id !== userId && currentUser.role !== UserRole.ADMIN) {
      return reply.code(403).send({ error: 'Insufficient permissions' })
    }

    // Only admins can change roles
    if (updateData.role && currentUser.role !== UserRole.ADMIN) {
      return reply.code(403).send({ error: 'Only admins can change user roles' })
    }

    try {
      const user = await server.prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          updatedAt: true,
        },
      })

      return {
        message: 'User updated successfully',
        user,
      }
    } catch (error) {
      server.log.error(error)
      if ((error as any).code === 'P2025') {
        return reply.code(404).send({ error: 'User not found' })
      }
      return reply.code(400).send({ error: 'Invalid request data' })
    }
  })
}