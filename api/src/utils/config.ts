import { z } from 'zod'

const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  HOST: z.string().default('0.0.0.0'),
  
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  
  // Redis
  REDIS_URL: z.string().min(1, 'REDIS_URL is required'),
  
  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  
  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  
  // Logging
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  
  // Scoring (Future implementation)
  SCORING_TIMEOUT_SEC: z.coerce.number().default(30),
  SCORING_MEMORY_LIMIT: z.string().default('512m'),
  SCORING_CPU_LIMIT: z.coerce.number().default(1),
})

const env = configSchema.parse(process.env)

export const config = {
  isDevelopment: env.NODE_ENV === 'development',
  isTest: env.NODE_ENV === 'test',
  isProduction: env.NODE_ENV === 'production',
  
  server: {
    port: env.PORT,
    host: env.HOST,
  },
  
  database: {
    url: env.DATABASE_URL,
  },
  
  redis: {
    url: env.REDIS_URL,
  },
  
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
  },
  
  cors: {
    origin: env.CORS_ORIGIN.split(',').map(origin => origin.trim()),
  },
  
  log: {
    level: env.LOG_LEVEL,
  },
  
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX_REQUESTS,
  },
  
  scoring: {
    timeoutSec: env.SCORING_TIMEOUT_SEC,
    memoryLimit: env.SCORING_MEMORY_LIMIT,
    cpuLimit: env.SCORING_CPU_LIMIT,
  },
} as const

export type Config = typeof config