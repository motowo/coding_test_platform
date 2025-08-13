import { FastifyInstance } from 'fastify'
import { beforeEach, afterEach, describe, it, expect } from 'vitest'
import { buildApp } from '../../src/app'

describe('Code Execution API', () => {
  let app: FastifyInstance

  beforeEach(async () => {
    app = buildApp({ logger: { level: 'silent' } })
    await app.ready()
  })

  afterEach(async () => {
    await app.close()
  })

  describe('POST /api/v1/execute', () => {
    it('should execute JavaScript code successfully', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/execute',
        payload: {
          language: 'javascript',
          code: 'console.log("Hello, World!")',
          input: ''
        }
      })

      expect(response.statusCode).toBe(200)
      const result = response.json()
      expect(result).toEqual({
        success: true,
        output: 'Hello, World!\n',
        error: null,
        executionTime: expect.any(Number)
      })
      expect(result.executionTime).toBeLessThan(3000) // 3秒以内の実行要件
    })

    it('should execute Python code successfully', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/execute',
        payload: {
          language: 'python',
          code: 'print("Hello, World!")',
          input: ''
        }
      })

      expect(response.statusCode).toBe(200)
      const result = response.json()
      expect(result).toEqual({
        success: true,
        output: 'Hello, World!\n',
        error: null,
        executionTime: expect.any(Number)
      })
    })

    it('should handle code execution with input', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/execute',
        payload: {
          language: 'javascript',
          code: `
            const readline = require('readline');
            const rl = readline.createInterface({
              input: process.stdin,
              output: process.stdout
            });
            
            rl.on('line', (input) => {
              console.log('Input received:', input);
              rl.close();
            });
          `,
          input: 'test input'
        }
      })

      expect(response.statusCode).toBe(200)
      const result = response.json()
      expect(result.success).toBe(true)
      expect(result.output).toContain('Input received: test input')
    })

    it('should handle code execution errors safely', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/execute',
        payload: {
          language: 'javascript',
          code: 'throw new Error("Test error")',
          input: ''
        }
      })

      expect(response.statusCode).toBe(200)
      const result = response.json()
      expect(result.success).toBe(false)
      expect(result.error).toContain('Test error')
      expect(result.output).toBe('')
    })

    it('should timeout long-running code', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/execute',
        payload: {
          language: 'javascript',
          code: 'while(true) { /* infinite loop */ }',
          input: ''
        }
      })

      expect(response.statusCode).toBe(200)
      const result = response.json()
      expect(result.success).toBe(false)
      expect(result.error).toContain('timeout')
    })

    it('should validate required fields', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/execute',
        payload: {
          language: 'javascript'
          // missing code field
        }
      })

      expect(response.statusCode).toBe(400)
      const result = response.json()
      expect(result.message).toContain('code')
    })

    it('should validate supported languages', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/execute',
        payload: {
          language: 'unsupported-language',
          code: 'console.log("test")',
          input: ''
        }
      })

      expect(response.statusCode).toBe(400)
      const result = response.json()
      expect(result.message).toContain('language')
    })

    it('should enforce memory and CPU limits', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/execute',
        payload: {
          language: 'javascript',
          code: `
            // Try to allocate excessive memory
            const largeArray = new Array(1000000000);
            for (let i = 0; i < largeArray.length; i++) {
              largeArray[i] = 'x'.repeat(1000);
            }
            console.log("Memory allocation completed");
          `,
          input: ''
        }
      })

      expect(response.statusCode).toBe(200)
      const result = response.json()
      expect(result.success).toBe(false)
      expect(result.error).toMatch(/memory|limit|resource/i)
    })

    it('should isolate network access', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/execute',
        payload: {
          language: 'javascript',
          code: `
            const https = require('https');
            https.get('https://httpbin.org/get', (res) => {
              console.log('Network access successful');
            }).on('error', (err) => {
              console.log('Network access blocked:', err.message);
            });
          `,
          input: ''
        }
      })

      expect(response.statusCode).toBe(200)
      const result = response.json()
      expect(result.output).toMatch(/blocked|denied|network/i)
    })
  })
})