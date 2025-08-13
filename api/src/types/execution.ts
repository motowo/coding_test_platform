export interface CodeExecutionRequest {
  language: string
  code: string
  input: string
  timeout?: number
}

export interface CodeExecutionResult {
  success: boolean
  output: string
  error: string | null
  executionTime: number
  exitCode?: number
}

export interface ExecutionConfig {
  image: string
  command: string[]
  timeout: number
  memoryLimit: number
  cpuShares: number
  networkMode: string
  user: string
  workingDir: string
  readOnlyRootFs: boolean
  environment: Record<string, string>
}

export interface ContainerResult {
  success: boolean
  output: string
  error: string
  exitCode: number
  executionTime: number
}

export interface LanguageConfig {
  name: string
  image: string
  command: (code: string) => string[]
  timeout: number
  memoryLimit: number
  cpuShares: number
}

export const SUPPORTED_LANGUAGES: Record<string, LanguageConfig> = {
  javascript: {
    name: 'JavaScript (Node.js)',
    image: 'node:18-alpine',
    command: (code: string) => ['node', '-e', code],
    timeout: 5000,
    memoryLimit: 128 * 1024 * 1024, // 128MB
    cpuShares: 512
  },
  python: {
    name: 'Python',
    image: 'python:3.11-alpine',
    command: (code: string) => ['python', '-c', code],
    timeout: 5000,
    memoryLimit: 128 * 1024 * 1024, // 128MB
    cpuShares: 512
  },
  java: {
    name: 'Java',
    image: 'openjdk:11-alpine',
    command: (code: string) => ['java', '-cp', '/tmp', 'Main'],
    timeout: 10000,
    memoryLimit: 256 * 1024 * 1024, // 256MB (Java needs more memory)
    cpuShares: 512
  },
  go: {
    name: 'Go',
    image: 'golang:1.19-alpine',
    command: (code: string) => ['go', 'run', '/tmp/main.go'],
    timeout: 10000,
    memoryLimit: 128 * 1024 * 1024, // 128MB
    cpuShares: 512
  }
}

export const SECURITY_CONSTRAINTS = {
  MAX_MEMORY: 512 * 1024 * 1024, // 512MB max
  MAX_TIMEOUT: 30000, // 30 seconds max
  MAX_CPU_SHARES: 1024,
  ALLOWED_NETWORK_MODES: ['none'],
  ALLOWED_USERS: ['nobody'],
  ALLOWED_WORK_DIRS: ['/tmp'],
  DANGEROUS_ENV_VARS: ['PATH', 'LD_LIBRARY_PATH', 'HOME', 'USER', 'SHELL'],
  ALLOWED_IMAGES: [
    'node:18-alpine',
    'python:3.11-alpine', 
    'openjdk:11-alpine',
    'golang:1.19-alpine'
  ]
} as const