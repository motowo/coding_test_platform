import { beforeAll, afterAll, describe, expect, it } from 'vitest'
import { PrismaClient } from '@prisma/client'

describe('Database Connection', () => {
  let prisma: PrismaClient

  beforeAll(async () => {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env['DATABASE_URL']
        }
      }
    })
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('should connect to database successfully', async () => {
    const result = await prisma.$queryRaw`SELECT 1 as test`
    expect(result).toBeDefined()
  })

  it('should check database schema tables exist', async () => {
    const tables = await prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `
    
    const tableNames = tables.map(t => t.table_name)
    expect(tableNames).toContain('users')
    expect(tableNames).toContain('problems')
    expect(tableNames).toContain('assessments')
  })
})