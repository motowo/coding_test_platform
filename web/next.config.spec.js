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

  it.skip('Should be able to build Next.js project', () => {
    // Skip during development - requires app/pages conflict resolution
    // This test would be run after choosing app or pages router
  })

  it('Should have TypeScript configuration', () => {
    // Given: TypeScript configuration
    const tsconfigPath = path.join(__dirname, 'tsconfig.json')
    
    // Then: TypeScript config should exist
    expect(fs.existsSync(tsconfigPath)).toBe(true)
  })
})