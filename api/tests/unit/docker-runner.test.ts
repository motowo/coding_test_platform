import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock Dockerode
const mockContainer = {
  start: vi.fn(),
  wait: vi.fn(),
  logs: vi.fn(),
  remove: vi.fn()
}

const mockDocker = {
  createContainer: vi.fn(),
  getContainer: vi.fn(() => mockContainer)
}

vi.mock('dockerode', () => {
  return {
    default: vi.fn(() => mockDocker)
  }
})

// Import after mocking
import { DockerRunner } from '../../src/services/docker-runner'
import { ExecutionConfig } from '../../src/types/execution'

describe('DockerRunner', () => {
  let dockerRunner: DockerRunner

  beforeEach(() => {
    dockerRunner = new DockerRunner()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('runCode', () => {
    it('should create and run container with proper configuration', async () => {
      // Setup mocks
      mockDocker.createContainer.mockResolvedValue({ id: 'test-container' })
      mockContainer.start.mockResolvedValue({})
      mockContainer.wait.mockResolvedValue({ StatusCode: 0 })
      mockContainer.logs.mockResolvedValue(Buffer.from('Hello World'))
      mockContainer.remove.mockResolvedValue({})

      const config: ExecutionConfig = {
        image: 'node:18-alpine',
        command: ['node', '-e', 'console.log("Hello World")'],
        timeout: 5000,
        memoryLimit: 128 * 1024 * 1024,
        cpuShares: 512,
        networkMode: 'none',
        user: 'nobody',
        workingDir: '/tmp',
        readOnlyRootFs: true,
        environment: {}
      }

      const result = await dockerRunner.runCode(config)

      expect(result).toEqual({
        success: true,
        output: 'Hello World',
        error: '',
        exitCode: 0,
        executionTime: expect.any(Number)
      })

      // Verify container creation with security settings
      expect(mockDocker.createContainer).toHaveBeenCalledWith({
        Image: 'node:18-alpine',
        Cmd: ['node', '-e', 'console.log("Hello World")'],
        AttachStdout: true,
        AttachStderr: true,
        NetworkMode: 'none',
        Memory: 128 * 1024 * 1024,
        CpuShares: 512,
        User: 'nobody',
        WorkingDir: '/tmp',
        Env: [],
        HostConfig: {
          ReadonlyRootfs: true,
          AutoRemove: false,
          NetworkMode: 'none',
          Memory: 128 * 1024 * 1024,
          CpuShares: 512
        }
      })

      expect(mockContainer.start).toHaveBeenCalled()
      expect(mockContainer.wait).toHaveBeenCalled()
      expect(mockContainer.remove).toHaveBeenCalled()
    })

    it('should handle container execution failure', async () => {
      mockDocker.createContainer.mockResolvedValue({ id: 'failed-container' })
      mockContainer.start.mockResolvedValue({})
      mockContainer.wait.mockResolvedValue({ StatusCode: 1 })
      mockContainer.logs.mockResolvedValue(Buffer.from('', 'utf8')) // stdout
      mockContainer.logs.mockResolvedValueOnce(Buffer.from('Runtime error', 'utf8')) // stderr
      mockContainer.remove.mockResolvedValue({})

      const config: ExecutionConfig = {
        image: 'node:18-alpine',
        command: ['node', '-e', 'throw new Error("test")'],
        timeout: 5000,
        memoryLimit: 128 * 1024 * 1024,
        cpuShares: 512,
        networkMode: 'none',
        user: 'nobody',
        workingDir: '/tmp',
        readOnlyRootFs: true,
        environment: {}
      }

      const result = await dockerRunner.runCode(config)

      expect(result.success).toBe(false)
      expect(result.exitCode).toBe(1)
      expect(result.error).toBeTruthy()
    })

    it('should enforce timeout limits', async () => {
      mockDocker.createContainer.mockResolvedValue({ id: 'timeout-container' })
      mockContainer.start.mockResolvedValue({})
      
      // Mock long-running container
      mockContainer.wait.mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => resolve({ StatusCode: 124 }), 10000) // 10 seconds
        })
      })
      
      mockContainer.remove.mockResolvedValue({})

      const config: ExecutionConfig = {
        image: 'node:18-alpine',
        command: ['node', '-e', 'while(true) {}'],
        timeout: 1000, // 1 second timeout
        memoryLimit: 128 * 1024 * 1024,
        cpuShares: 512,
        networkMode: 'none',
        user: 'nobody',
        workingDir: '/tmp',
        readOnlyRootFs: true,
        environment: {}
      }

      const startTime = Date.now()
      const result = await dockerRunner.runCode(config)
      const endTime = Date.now()

      expect(endTime - startTime).toBeLessThan(2000) // Should timeout within reasonable time
      expect(result.success).toBe(false)
      expect(result.error).toContain('timeout')
      expect(mockContainer.remove).toHaveBeenCalled()
    })

    it('should clean up container on error', async () => {
      mockDocker.createContainer.mockResolvedValue({ id: 'cleanup-container' })
      mockContainer.start.mockRejectedValue(new Error('Start failed'))
      mockContainer.remove.mockResolvedValue({})

      const config: ExecutionConfig = {
        image: 'node:18-alpine',
        command: ['node', '-e', 'console.log("test")'],
        timeout: 5000,
        memoryLimit: 128 * 1024 * 1024,
        cpuShares: 512,
        networkMode: 'none',
        user: 'nobody',
        workingDir: '/tmp',
        readOnlyRootFs: true,
        environment: {}
      }

      await expect(dockerRunner.runCode(config)).rejects.toThrow('Start failed')
      expect(mockContainer.remove).toHaveBeenCalled()
    })

    it('should handle environment variables securely', async () => {
      mockDocker.createContainer.mockResolvedValue({ id: 'env-container' })
      mockContainer.start.mockResolvedValue({})
      mockContainer.wait.mockResolvedValue({ StatusCode: 0 })
      mockContainer.logs.mockResolvedValue(Buffer.from('output'))
      mockContainer.remove.mockResolvedValue({})

      const config: ExecutionConfig = {
        image: 'node:18-alpine',
        command: ['node', '-e', 'console.log(process.env.TEST_VAR)'],
        timeout: 5000,
        memoryLimit: 128 * 1024 * 1024,
        cpuShares: 512,
        networkMode: 'none',
        user: 'nobody',
        workingDir: '/tmp',
        readOnlyRootFs: true,
        environment: {
          TEST_VAR: 'test_value'
        }
      }

      await dockerRunner.runCode(config)

      const createCall = mockDocker.createContainer.mock.calls[0][0]
      expect(createCall.Env).toContain('TEST_VAR=test_value')
    })

    it('should prevent dangerous environment variables', async () => {
      const config: ExecutionConfig = {
        image: 'node:18-alpine',
        command: ['node', '-e', 'console.log("test")'],
        timeout: 5000,
        memoryLimit: 128 * 1024 * 1024,
        cpuShares: 512,
        networkMode: 'none',
        user: 'nobody',
        workingDir: '/tmp',
        readOnlyRootFs: true,
        environment: {
          PATH: '/malicious/path',
          LD_LIBRARY_PATH: '/malicious/lib',
          HOME: '/root' // Should be filtered out
        }
      }

      await expect(dockerRunner.runCode(config)).rejects.toThrow(/dangerous.*environment/i)
    })

    it('should limit resource usage', async () => {
      mockDocker.createContainer.mockResolvedValue({ id: 'resource-container' })

      const config: ExecutionConfig = {
        image: 'node:18-alpine',
        command: ['node', '-e', 'console.log("test")'],
        timeout: 5000,
        memoryLimit: 256 * 1024 * 1024, // 256MB
        cpuShares: 1024, // Higher CPU shares
        networkMode: 'none',
        user: 'nobody',
        workingDir: '/tmp',
        readOnlyRootFs: true,
        environment: {}
      }

      await dockerRunner.runCode(config)

      const createCall = mockDocker.createContainer.mock.calls[0][0]
      expect(createCall.Memory).toBe(256 * 1024 * 1024)
      expect(createCall.CpuShares).toBe(1024)
      expect(createCall.HostConfig.Memory).toBe(256 * 1024 * 1024)
      expect(createCall.HostConfig.CpuShares).toBe(1024)
    })
  })

  describe('isImageSafe', () => {
    it('should allow safe images', () => {
      const safeImages = [
        'node:18-alpine',
        'python:3.11-alpine',
        'openjdk:11-alpine',
        'golang:1.19-alpine'
      ]

      safeImages.forEach(image => {
        expect(dockerRunner.isImageSafe(image)).toBe(true)
      })
    })

    it('should reject unsafe images', () => {
      const unsafeImages = [
        'ubuntu:latest',
        'malicious/image',
        'node:18', // Not alpine
        'custom-image:latest'
      ]

      unsafeImages.forEach(image => {
        expect(dockerRunner.isImageSafe(image)).toBe(false)
      })
    })
  })

  describe('validateConfig', () => {
    it('should validate safe configuration', () => {
      const validConfig: ExecutionConfig = {
        image: 'node:18-alpine',
        command: ['node', '-e', 'console.log("test")'],
        timeout: 5000,
        memoryLimit: 128 * 1024 * 1024,
        cpuShares: 512,
        networkMode: 'none',
        user: 'nobody',
        workingDir: '/tmp',
        readOnlyRootFs: true,
        environment: {}
      }

      expect(() => dockerRunner.validateConfig(validConfig)).not.toThrow()
    })

    it('should reject configuration with privileged settings', () => {
      const privilegedConfig = {
        image: 'node:18-alpine',
        command: ['node', '-e', 'console.log("test")'],
        timeout: 5000,
        memoryLimit: 128 * 1024 * 1024,
        cpuShares: 512,
        networkMode: 'host', // Dangerous: host network access
        user: 'root', // Dangerous: root user
        workingDir: '/tmp',
        readOnlyRootFs: false, // Dangerous: writable root filesystem
        environment: {}
      } as ExecutionConfig

      expect(() => dockerRunner.validateConfig(privilegedConfig)).toThrow(/security.*violation/i)
    })
  })
})