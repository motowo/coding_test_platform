import Docker from 'dockerode'
import { ExecutionConfig, ContainerResult, SECURITY_CONSTRAINTS } from '../types/execution'

export class DockerRunner {
  private docker: Docker

  constructor() {
    this.docker = new Docker()
  }

  async runCode(config: ExecutionConfig): Promise<ContainerResult> {
    // Validate configuration for security
    this.validateConfig(config)
    
    let containerId: string | null = null
    const startTime = Date.now()

    try {
      // Create container with security settings
      const container = await this.docker.createContainer({
        Image: config.image,
        Cmd: config.command,
        AttachStdout: true,
        AttachStderr: true,
        NetworkMode: config.networkMode,
        Memory: config.memoryLimit,
        CpuShares: config.cpuShares,
        User: config.user,
        WorkingDir: config.workingDir,
        Env: Object.entries(config.environment).map(([key, value]) => `${key}=${value}`),
        HostConfig: {
          ReadonlyRootfs: config.readOnlyRootFs,
          AutoRemove: false,
          NetworkMode: config.networkMode,
          Memory: config.memoryLimit,
          CpuShares: config.cpuShares
        }
      })

      containerId = container.id

      // Get actual container instance from Docker daemon
      const dockerContainer = this.docker.getContainer(containerId)

      // Start container
      await dockerContainer.start()

      // Wait for completion with timeout
      const waitPromise = dockerContainer.wait()
      const timeoutPromise = new Promise<{ StatusCode: number }>((_, reject) => {
        setTimeout(() => reject(new Error('Container execution timeout')), config.timeout)
      })

      const result = await Promise.race([waitPromise, timeoutPromise])
      
      // Get logs
      const logs = await dockerContainer.logs({
        stdout: true,
        stderr: true
      })

      const output = logs.toString('utf8')
      const executionTime = Date.now() - startTime

      // Clean up
      await dockerContainer.remove()

      return {
        success: result.StatusCode === 0,
        output: result.StatusCode === 0 ? output : '',
        error: result.StatusCode !== 0 ? output : '',
        exitCode: result.StatusCode,
        executionTime
      }

    } catch (error) {
      // Clean up container on error
      if (containerId) {
        try {
          const dockerContainer = this.docker.getContainer(containerId)
          await dockerContainer.remove()
        } catch (cleanupError) {
          // Ignore cleanup errors
        }
      }

      const executionTime = Date.now() - startTime

      if (error instanceof Error && error.message.includes('timeout')) {
        return {
          success: false,
          output: '',
          error: `Container execution timeout after ${config.timeout}ms`,
          exitCode: 124, // Timeout exit code
          executionTime
        }
      }

      throw error
    }
  }

  validateConfig(config: ExecutionConfig): void {
    // Validate image safety
    if (!this.isImageSafe(config.image)) {
      throw new Error(`Security violation: Unsafe image ${config.image}`)
    }

    // Validate network mode
    if (!SECURITY_CONSTRAINTS.ALLOWED_NETWORK_MODES.includes(config.networkMode as any)) {
      throw new Error(`Security violation: Invalid network mode ${config.networkMode}`)
    }

    // Validate user
    if (!SECURITY_CONSTRAINTS.ALLOWED_USERS.includes(config.user as any)) {
      throw new Error(`Security violation: Invalid user ${config.user}`)
    }

    // Validate memory limit
    if (config.memoryLimit > SECURITY_CONSTRAINTS.MAX_MEMORY) {
      throw new Error(`Security violation: Memory limit exceeds maximum`)
    }

    // Validate timeout
    if (config.timeout > SECURITY_CONSTRAINTS.MAX_TIMEOUT) {
      throw new Error(`Security violation: Timeout exceeds maximum`)
    }

    // Check for dangerous environment variables
    const dangerousVars = Object.keys(config.environment).filter(key => 
      SECURITY_CONSTRAINTS.DANGEROUS_ENV_VARS.includes(key)
    )
    
    if (dangerousVars.length > 0) {
      throw new Error(`Security violation: Dangerous environment variables: ${dangerousVars.join(', ')}`)
    }

    // Validate read-only root filesystem requirement
    if (!config.readOnlyRootFs) {
      throw new Error(`Security violation: Read-only root filesystem required`)
    }
  }

  isImageSafe(image: string): boolean {
    return SECURITY_CONSTRAINTS.ALLOWED_IMAGES.includes(image)
  }
}