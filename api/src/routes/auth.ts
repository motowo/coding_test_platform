import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { UserRole } from '@prisma/client'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const registerSchema = z.object({
  name: z.string().min(2).max(255),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.nativeEnum(UserRole).default(UserRole.CANDIDATE),
})

export async function authRoutes(server: FastifyInstance) {
  // Login
  server.post('/login', {
    schema: {
      tags: ['Authentication'],
      summary: 'User login',
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                name: { type: 'string' },
                email: { type: 'string' },
                role: { type: 'string' },
              },
            },
          },
        },
        400: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
        401: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const { email, password } = loginSchema.parse(request.body)

      const user = await server.prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          passwordHash: true,
        },
      })

      if (!user) {
        return reply.code(401).send({ error: 'Invalid credentials' })
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash)
      if (!isValidPassword) {
        return reply.code(401).send({ error: 'Invalid credentials' })
      }

      const token = server.jwt.sign({
        id: user.id,
        email: user.email,
        role: user.role,
      })

      return {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      }
    } catch (error) {
      server.log.error(error)
      return reply.code(400).send({ error: 'Invalid request data' })
    }
  })

  // Register
  server.post('/register', {
    schema: {
      tags: ['Authentication'],
      summary: 'User registration',
      body: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 255 },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
          role: { type: 'string', enum: ['CANDIDATE', 'RECRUITER', 'CREATOR'], default: 'CANDIDATE' },
        },
      },
      response: {
        201: {
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
              },
            },
          },
        },
        400: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
        409: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const { name, email, password, role } = registerSchema.parse(request.body)

      // Check if user already exists
      const existingUser = await server.prisma.user.findUnique({
        where: { email },
      })

      if (existingUser) {
        return reply.code(409).send({ error: 'User already exists' })
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password as string, 12)

      // Create user
      const user = await server.prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          role,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      })

      return reply.code(201).send({
        message: 'User created successfully',
        user,
      })
    } catch (error) {
      server.log.error(error)
      return reply.code(400).send({ error: 'Invalid request data' })
    }
  })

  // Get current user profile
  server.get('/me', {
    preHandler: [server.authenticate],
    schema: {
      tags: ['Authentication'],
      summary: 'Get current user profile',
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        401: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  }, async (request) => {
    const userId = (request as any).user.id

    const user = await server.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    return user
  })
}