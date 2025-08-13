import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock Docker API
const mockDockerAPI = {
  createContainer: vi.fn(),
  startContainer: vi.fn(),
  waitContainer: vi.fn(),
  getLogs: vi.fn(),
  removeContainer: vi.fn()
}

vi.mock('dockerode', () => {
  return {
    default: vi.fn(() => mockDockerAPI)
  }
})

// Import after mocking
import { ScoringService } from '../../src/services/scoring-service'

describe('ScoringService', () => {
  let scoringService: ScoringService

  beforeEach(() => {
    scoringService = new ScoringService()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('executeCode', () => {
    it('should execute JavaScript code in isolated container', async () => {
      // Mock successful container execution
      mockDockerAPI.createContainer.mockResolvedValue({ id: 'container-123' })
      mockDockerAPI.startContainer.mockResolvedValue({})
      mockDockerAPI.waitContainer.mockResolvedValue({ StatusCode: 0 })
      mockDockerAPI.getLogs.mockResolvedValue(Buffer.from('Hello, World!\n'))
      mockDockerAPI.removeContainer.mockResolvedValue({})

      const result = await scoringService.executeCode({
        language: 'javascript',
        code: 'console.log("Hello, World!")',
        input: '',
        timeout: 5000
      })

      expect(result).toEqual({
        success: true,
        output: 'Hello, World!\n',
        error: null,
        executionTime: expect.any(Number)
      })

      // Verify container lifecycle
      expect(mockDockerAPI.createContainer).toHaveBeenCalledWith({
        Image: 'node:18-alpine',
        Cmd: ['node', '-e', 'console.log("Hello, World!")'],
        AttachStdout: true,
        AttachStderr: true,
        NetworkMode: 'none', // Network isolation
        Memory: 128 * 1024 * 1024, // 128MB limit
        CpuShares: 512, // CPU limit
        User: 'nobody', // Non-root user
        WorkingDir: '/tmp',
        HostConfig: {
          ReadonlyRootfs: true,
          AutoRemove: false
        }
      })
      expect(mockDockerAPI.startContainer).toHaveBeenCalled()
      expect(mockDockerAPI.removeContainer).toHaveBeenCalled()
    })

    it('should execute Python code in isolated container', async () => {
      mockDockerAPI.createContainer.mockResolvedValue({ id: 'container-456' })
      mockDockerAPI.startContainer.mockResolvedValue({})
      mockDockerAPI.waitContainer.mockResolvedValue({ StatusCode: 0 })
      mockDockerAPI.getLogs.mockResolvedValue(Buffer.from('Python output\n'))
      mockDockerAPI.removeContainer.mockResolvedValue({})

      const result = await scoringService.executeCode({
        language: 'python',
        code: 'print("Python output")',
        input: '',
        timeout: 5000
      })

      expect(result.success).toBe(true)
      expect(result.output).toBe('Python output\n')
      
      expect(mockDockerAPI.createContainer).toHaveBeenCalledWith({
        Image: 'python:3.11-alpine',
        Cmd: ['python', '-c', 'print("Python output")'],
        AttachStdout: true,
        AttachStderr: true,
        NetworkMode: 'none',
        Memory: 128 * 1024 * 1024,
        CpuShares: 512,
        User: 'nobody',
        WorkingDir: '/tmp',
        HostConfig: {
          ReadonlyRootfs: true,
          AutoRemove: false
        }
      })
    })

    it('should handle container execution errors', async () => {
      mockDockerAPI.createContainer.mockResolvedValue({ id: 'container-error' })
      mockDockerAPI.startContainer.mockResolvedValue({})
      mockDockerAPI.waitContainer.mockResolvedValue({ StatusCode: 1 })
      mockDockerAPI.getLogs.mockResolvedValue(Buffer.from('Error: Test error\n'))
      mockDockerAPI.removeContainer.mockResolvedValue({})

      const result = await scoringService.executeCode({
        language: 'javascript',
        code: 'throw new Error("Test error")',
        input: '',
        timeout: 5000
      })

      expect(result).toEqual({
        success: false,
        output: '',
        error: 'Error: Test error\n',
        executionTime: expect.any(Number)
      })
    })

    it('should handle timeout scenarios', async () => {
      mockDockerAPI.createContainer.mockResolvedValue({ id: 'container-timeout' })
      mockDockerAPI.startContainer.mockResolvedValue({})
      mockDockerAPI.waitContainer.mockImplementation(() => {
        return new Promise((resolve) => {
          // Simulate long-running process that exceeds timeout
          setTimeout(() => resolve({ StatusCode: 124 }), 6000)
        })
      })
      mockDockerAPI.removeContainer.mockResolvedValue({})

      const result = await scoringService.executeCode({
        language: 'javascript',
        code: 'while(true) {}',
        input: '',
        timeout: 1000 // 1 second timeout
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('timeout')
      expect(mockDockerAPI.removeContainer).toHaveBeenCalled()
    })

    it('should clean up containers after execution', async () => {
      mockDockerAPI.createContainer.mockResolvedValue({ id: 'container-cleanup' })
      mockDockerAPI.startContainer.mockResolvedValue({})
      mockDockerAPI.waitContainer.mockResolvedValue({ StatusCode: 0 })
      mockDockerAPI.getLogs.mockResolvedValue(Buffer.from('output'))
      mockDockerAPI.removeContainer.mockResolvedValue({})

      await scoringService.executeCode({
        language: 'javascript',
        code: 'console.log("test")',
        input: '',
        timeout: 5000
      })

      expect(mockDockerAPI.removeContainer).toHaveBeenCalledWith('container-cleanup')
    })

    it('should clean up containers even on error', async () => {
      mockDockerAPI.createContainer.mockResolvedValue({ id: 'container-error-cleanup' })
      mockDockerAPI.startContainer.mockRejectedValue(new Error('Container start failed'))
      mockDockerAPI.removeContainer.mockResolvedValue({})

      await expect(scoringService.executeCode({
        language: 'javascript',
        code: 'console.log("test")',
        input: '',
        timeout: 5000
      })).rejects.toThrow()

      expect(mockDockerAPI.removeContainer).toHaveBeenCalledWith('container-error-cleanup')
    })

    it('should validate language support', async () => {
      await expect(scoringService.executeCode({
        language: 'unsupported-lang',
        code: 'test code',
        input: '',
        timeout: 5000
      })).rejects.toThrow('Unsupported language: unsupported-lang')
    })

    it('should enforce security constraints', async () => {
      mockDockerAPI.createContainer.mockResolvedValue({ id: 'container-security' })

      await scoringService.executeCode({
        language: 'javascript',
        code: 'console.log("test")',
        input: '',
        timeout: 5000
      })

      const createCall = mockDockerAPI.createContainer.mock.calls[0][0]
      
      // Verify security settings
      expect(createCall.NetworkMode).toBe('none') // No network access
      expect(createCall.User).toBe('nobody') // Non-root user
      expect(createCall.Memory).toBe(128 * 1024 * 1024) // Memory limit
      expect(createCall.CpuShares).toBe(512) // CPU limit
      expect(createCall.HostConfig.ReadonlyRootfs).toBe(true) // Read-only filesystem
    })
  })

  describe('getSupportedLanguages', () => {
    it('should return list of supported languages', () => {
      const languages = scoringService.getSupportedLanguages()
      
      expect(languages).toContain('javascript')
      expect(languages).toContain('python')
      expect(languages).toBeInstanceOf(Array)
      expect(languages.length).toBeGreaterThan(0)
    })
  })
})