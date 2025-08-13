import { FastifyInstance, FastifyRequest } from 'fastify'
import { Difficulty, UserRole } from '@prisma/client'

interface CreateProblemBody {
  title: string
  description: string
  difficulty: Difficulty
  category?: string
  estimatedTimeMinutes?: number
  testCases?: Array<{
    name?: string
    input?: string
    expectedOutput?: string
    isHidden?: boolean
    weight?: number
  }>
}

interface UpdateProblemBody {
  title?: string
  description?: string
  difficulty?: Difficulty
  category?: string
  estimatedTimeMinutes?: number
}

interface CreateTestCaseBody {
  name?: string
  input?: string
  expectedOutput?: string
  isHidden?: boolean
  weight?: number
}

export async function problemRoutes(server: FastifyInstance) {
  // List all problems
  server.get('/', async (request) => {
    const { page = '1', limit = '20', difficulty, category, search } = request.query as any

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const take = parseInt(limit)

    const where: any = {}

    if (difficulty) {
      where.difficulty = difficulty
    }

    if (category) {
      where.category = { contains: category, mode: 'insensitive' }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [problems, total] = await Promise.all([
      server.prisma.problem.findMany({
        where,
        skip,
        take,
        include: {
          author: {
            select: { id: true, name: true, email: true },
          },
          testCases: {
            select: { id: true, name: true, isHidden: true, weight: true },
          },
          _count: {
            select: { submissions: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      server.prisma.problem.count({ where }),
    ])

    return {
      problems,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    }
  })

  // Get problem by ID
  server.get('/:id', async (request) => {
    const { id } = request.params as { id: string }

    const problem = await server.prisma.problem.findUnique({
      where: { id: parseInt(id) },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
        testCases: true,
        _count: {
          select: { submissions: true },
        },
      },
    })

    if (!problem) {
      throw server.httpErrors.notFound('Problem not found')
    }

    return { problem }
  })

  // Create new problem
  server.post(
    '/',
    {
      preHandler: [server.authenticate],
    },
    async (request: FastifyRequest<{ Body: CreateProblemBody }>) => {
      const user = (request as any).user

      // Check if user has permission to create problems
      if (![UserRole.CREATOR, UserRole.ADMIN].includes(user.role)) {
        throw server.httpErrors.forbidden('Insufficient permissions to create problems')
      }

      const { title, description, difficulty, category, estimatedTimeMinutes, testCases } =
        request.body

      const problem = await server.prisma.problem.create({
        data: {
          title,
          description,
          difficulty,
          category,
          estimatedTimeMinutes,
          authorId: user.id,
          testCases: testCases
            ? {
                create: testCases,
              }
            : undefined,
        },
        include: {
          author: {
            select: { id: true, name: true, email: true },
          },
          testCases: true,
        },
      })

      return { problem }
    }
  )

  // Update problem
  server.put(
    '/:id',
    {
      preHandler: [server.authenticate],
    },
    async (request: FastifyRequest<{ Params: { id: string }; Body: UpdateProblemBody }>) => {
      const user = (request as any).user
      const { id } = request.params
      const { title, description, difficulty, category, estimatedTimeMinutes } = request.body

      const existingProblem = await server.prisma.problem.findUnique({
        where: { id: parseInt(id) },
      })

      if (!existingProblem) {
        throw server.httpErrors.notFound('Problem not found')
      }

      // Check permissions: only author, creators, or admins can update
      if (
        ![UserRole.CREATOR, UserRole.ADMIN].includes(user.role) &&
        existingProblem.authorId !== user.id
      ) {
        throw server.httpErrors.forbidden('Insufficient permissions to update this problem')
      }

      const problem = await server.prisma.problem.update({
        where: { id: parseInt(id) },
        data: {
          title,
          description,
          difficulty,
          category,
          estimatedTimeMinutes,
        },
        include: {
          author: {
            select: { id: true, name: true, email: true },
          },
          testCases: true,
        },
      })

      return { problem }
    }
  )

  // Delete problem
  server.delete(
    '/:id',
    {
      preHandler: [server.authenticate],
    },
    async (request: FastifyRequest<{ Params: { id: string } }>) => {
      const user = (request as any).user
      const { id } = request.params

      const existingProblem = await server.prisma.problem.findUnique({
        where: { id: parseInt(id) },
      })

      if (!existingProblem) {
        throw server.httpErrors.notFound('Problem not found')
      }

      // Check permissions: only author or admins can delete
      if (user.role !== UserRole.ADMIN && existingProblem.authorId !== user.id) {
        throw server.httpErrors.forbidden('Insufficient permissions to delete this problem')
      }

      await server.prisma.problem.delete({
        where: { id: parseInt(id) },
      })

      return { message: 'Problem deleted successfully' }
    }
  )

  // Test Cases Management

  // Get test cases for a problem
  server.get('/:id/test-cases', async (request) => {
    const { id } = request.params as { id: string }

    const testCases = await server.prisma.testCase.findMany({
      where: { problemId: parseInt(id) },
      orderBy: { id: 'asc' },
    })

    return { testCases }
  })

  // Create test case for a problem
  server.post(
    '/:id/test-cases',
    {
      preHandler: [server.authenticate],
    },
    async (request: FastifyRequest<{ Params: { id: string }; Body: CreateTestCaseBody }>) => {
      const user = (request as any).user
      const { id } = request.params
      const { name, input, expectedOutput, isHidden = false, weight = 1.0 } = request.body

      const problem = await server.prisma.problem.findUnique({
        where: { id: parseInt(id) },
      })

      if (!problem) {
        throw server.httpErrors.notFound('Problem not found')
      }

      // Check permissions
      if (![UserRole.CREATOR, UserRole.ADMIN].includes(user.role) && problem.authorId !== user.id) {
        throw server.httpErrors.forbidden('Insufficient permissions to add test cases')
      }

      const testCase = await server.prisma.testCase.create({
        data: {
          problemId: parseInt(id),
          name,
          input,
          expectedOutput,
          isHidden,
          weight,
        },
      })

      return { testCase }
    }
  )

  // Update test case
  server.put(
    '/:id/test-cases/:testCaseId',
    {
      preHandler: [server.authenticate],
    },
    async (
      request: FastifyRequest<{
        Params: { id: string; testCaseId: string }
        Body: CreateTestCaseBody
      }>
    ) => {
      const user = (request as any).user
      const { id, testCaseId } = request.params
      const { name, input, expectedOutput, isHidden, weight } = request.body

      const [problem, testCase] = await Promise.all([
        server.prisma.problem.findUnique({
          where: { id: parseInt(id) },
        }),
        server.prisma.testCase.findUnique({
          where: { id: parseInt(testCaseId) },
        }),
      ])

      if (!problem) {
        throw server.httpErrors.notFound('Problem not found')
      }

      if (!testCase || testCase.problemId !== parseInt(id)) {
        throw server.httpErrors.notFound('Test case not found')
      }

      // Check permissions
      if (![UserRole.CREATOR, UserRole.ADMIN].includes(user.role) && problem.authorId !== user.id) {
        throw server.httpErrors.forbidden('Insufficient permissions to update test cases')
      }

      const updatedTestCase = await server.prisma.testCase.update({
        where: { id: parseInt(testCaseId) },
        data: {
          name,
          input,
          expectedOutput,
          isHidden,
          weight,
        },
      })

      return { testCase: updatedTestCase }
    }
  )

  // Delete test case
  server.delete(
    '/:id/test-cases/:testCaseId',
    {
      preHandler: [server.authenticate],
    },
    async (request: FastifyRequest<{ Params: { id: string; testCaseId: string } }>) => {
      const user = (request as any).user
      const { id, testCaseId } = request.params

      const [problem, testCase] = await Promise.all([
        server.prisma.problem.findUnique({
          where: { id: parseInt(id) },
        }),
        server.prisma.testCase.findUnique({
          where: { id: parseInt(testCaseId) },
        }),
      ])

      if (!problem) {
        throw server.httpErrors.notFound('Problem not found')
      }

      if (!testCase || testCase.problemId !== parseInt(id)) {
        throw server.httpErrors.notFound('Test case not found')
      }

      // Check permissions
      if (![UserRole.CREATOR, UserRole.ADMIN].includes(user.role) && problem.authorId !== user.id) {
        throw server.httpErrors.forbidden('Insufficient permissions to delete test cases')
      }

      await server.prisma.testCase.delete({
        where: { id: parseInt(testCaseId) },
      })

      return { message: 'Test case deleted successfully' }
    }
  )
}
