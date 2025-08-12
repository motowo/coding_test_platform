const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

describe('Next.js Configuration', () => {
  it('Should have proper Next.js configuration file', () => {
    // Given: Next.js project setup
    const configPath = path.join(__dirname, 'next.config.js')
    
    // Then: Configuration file should exist
    expect(fs.existsSync(configPath)).toBe(true)
  })

  it('Should be able to build Next.js project', () => {
    // Given: Next.js project is configured
    // When: Build command is executed
    // Then: Build should succeed without errors
    expect(() => {
      execSync('npx next build', { cwd: __dirname, stdio: 'pipe' })
    }).not.toThrow()
  })

  it('Should support TypeScript compilation', () => {
    // Given: TypeScript configuration
    const tsconfigPath = path.join(__dirname, 'tsconfig.json')
    
    // Then: TypeScript config should exist
    expect(fs.existsSync(tsconfigPath)).toBe(true)
    
    // When: TypeScript check is performed
    // Then: Should compile without errors
    expect(() => {
      execSync('npx tsc --noEmit', { cwd: __dirname, stdio: 'pipe' })
    }).not.toThrow()
  })
})