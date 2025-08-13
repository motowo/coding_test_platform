import { DockerRunner } from './docker-runner'
import {
  CodeExecutionRequest,
  CodeExecutionResult,
  SUPPORTED_LANGUAGES,
  ExecutionConfig,
} from '../types/execution'

export class ScoringService {
  private dockerRunner: DockerRunner

  constructor() {
    this.dockerRunner = new DockerRunner()
  }

  async executeCode(request: CodeExecutionRequest): Promise<CodeExecutionResult> {
    const startTime = Date.now()

    // Validate language support
    const langConfig = SUPPORTED_LANGUAGES[request.language]
    if (!langConfig) {
      throw new Error(`Unsupported language: ${request.language}`)
    }

    // Create execution configuration
    const execConfig: ExecutionConfig = {
      image: langConfig.image,
      command: langConfig.command(request.code),
      timeout: request.timeout || langConfig.timeout,
      memoryLimit: langConfig.memoryLimit,
      cpuShares: langConfig.cpuShares,
      networkMode: 'none', // Network isolation
      user: 'nobody', // Non-root user
      workingDir: '/tmp',
      readOnlyRootFs: true,
      environment: {},
    }

    try {
      const result = await this.dockerRunner.runCode(execConfig)
      const executionTime = Date.now() - startTime

      return {
        success: result.success,
        output: result.output,
        error: result.success ? null : result.error,
        executionTime,
      }
    } catch (error) {
      const executionTime = Date.now() - startTime

      return {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : 'Unknown execution error',
        executionTime,
      }
    }
  }

  getSupportedLanguages(): string[] {
    return Object.keys(SUPPORTED_LANGUAGES)
  }
}
