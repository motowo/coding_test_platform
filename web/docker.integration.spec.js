const { execSync } = require('child_process')

describe('Docker Integration', () => {
  it('Should be able to build web service with Docker', () => {
    // Given: Docker Compose configuration exists
    // When: Docker build is performed
    // Then: Build should succeed
    expect(() => {
      execSync('docker compose build web', { 
        cwd: path.join(__dirname, '..'), 
        stdio: 'pipe',
        timeout: 300000 // 5 minutes timeout
      })
    }).not.toThrow()
  })

  it('Should start web service and respond to health check', async () => {
    // Given: Web service is built
    // When: Service is started
    const serviceStarted = () => {
      execSync('docker compose up -d web', { 
        cwd: path.join(__dirname, '..'), 
        stdio: 'pipe' 
      })
    }
    
    // Then: Should start without errors
    expect(serviceStarted).not.toThrow()
    
    // And: Should respond to HTTP requests on port 3000
    const fetch = require('node-fetch')
    const response = await fetch('http://localhost:3000')
    expect(response.ok).toBe(true)
    
    // Cleanup
    execSync('docker compose down', { 
      cwd: path.join(__dirname, '..'), 
      stdio: 'pipe' 
    })
  }, 60000) // 60 seconds timeout
})