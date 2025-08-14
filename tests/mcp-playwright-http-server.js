#!/usr/bin/env node

/**
 * MCP Playwright HTTP Server (安定版)
 * HTTP形式でMCPプロトコルを提供し、長時間実行に対応
 */

const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs').promises;
const path = require('path');

class MCPPlaywrightHTTPServer {
  constructor() {
    this.browser = null;
    this.page = null;
    this.server = null;
  }

  // HTTP サーバーの開始
  async start(port = 3001) {
    this.server = http.createServer(async (req, res) => {
      // CORS設定
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }

      // ヘルスチェック
      if (req.method === 'GET' && req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          status: 'healthy', 
          timestamp: new Date().toISOString(),
          browser: this.browser ? 'connected' : 'disconnected'
        }));
        return;
      }

      // MCP リクエスト処理
      if (req.method === 'POST' && req.url === '/mcp') {
        try {
          let body = '';
          req.on('data', chunk => body += chunk.toString());
          req.on('end', async () => {
            try {
              const request = JSON.parse(body);
              console.log(`[MCP-HTTP] Processing: ${request.method}`);
              
              const response = await this.handleRequest(request);
              
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(response));
            } catch (error) {
              console.error(`[MCP-HTTP] Error processing request:`, error);
              const errorResponse = {
                jsonrpc: "2.0",
                id: req.id || null,
                error: {
                  code: -32603,
                  message: error.message,
                  data: error.stack
                }
              };
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(errorResponse));
            }
          });
        } catch (error) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid request' }));
        }
        return;
      }

      // その他のリクエスト
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
    });

    return new Promise((resolve, reject) => {
      this.server.listen(port, '0.0.0.0', (error) => {
        if (error) {
          reject(error);
        } else {
          console.log(`[MCP-HTTP] Server listening on http://0.0.0.0:${port}`);
          console.log(`[MCP-HTTP] Health check: http://0.0.0.0:${port}/health`);
          resolve();
        }
      });
    });
  }

  // MCPリクエスト処理（元のコードから移植）
  async handleRequest(request) {
    const { method, params, id } = request;
    
    let result;
    switch (method) {
      case 'initialize':
        result = await this.initialize(params);
        break;
      case 'tools/list':
        result = await this.listTools();
        break;
      case 'tools/call':
        result = await this.callTool(params);
        break;
      default:
        throw new Error(`Unknown method: ${method}`);
    }
    
    return {
      jsonrpc: "2.0",
      id: id,
      result: result
    };
  }

  // 初期化
  async initialize(params) {
    const supportedVersions = ["2024-11-05", "2025-06-18"];
    const requestedVersion = params?.protocolVersion;
    
    const protocolVersion = supportedVersions.includes(requestedVersion) 
      ? requestedVersion 
      : "2024-11-05";
    
    return {
      protocolVersion: protocolVersion,
      capabilities: {
        tools: {}
      },
      serverInfo: {
        name: "playwright-mcp-http-server",
        version: "1.0.0"
      }
    };
  }

  // ツール一覧
  async listTools() {
    return {
      tools: [
        {
          name: "screenshot",
          description: "ウェブページのスクリーンショットを撮影",
          inputSchema: {
            type: "object",
            properties: {
              url: {
                type: "string",
                description: "スクリーンショットを撮影するURL"
              },
              filename: {
                type: "string",
                description: "保存ファイル名（オプション）"
              },
              fullPage: {
                type: "boolean",
                description: "ページ全体のスクリーンショット",
                default: true
              },
              viewport: {
                type: "object",
                properties: {
                  width: { type: "number", default: 1280 },
                  height: { type: "number", default: 720 }
                }
              }
            },
            required: ["url"]
          }
        },
        {
          name: "test",
          description: "Playwrightテストの実行",
          inputSchema: {
            type: "object",
            properties: {
              config: {
                type: "string",
                description: "設定ファイルパス",
                default: "./playwright.config.ts"
              },
              testPattern: {
                type: "string",
                description: "実行するテストパターン"
              }
            }
          }
        },
        {
          name: "interact",
          description: "ウェブページ要素との相互作用",
          inputSchema: {
            type: "object",
            properties: {
              url: { type: "string", description: "操作するページのURL" },
              actions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: { 
                      type: "string", 
                      enum: ["click", "fill", "wait", "getText", "goto"]
                    },
                    selector: { type: "string" },
                    value: { type: "string" },
                    timeout: { type: "number", default: 5000 }
                  }
                }
              }
            },
            required: ["url"]
          }
        }
      ]
    };
  }

  // ツール実行
  async callTool(params) {
    const { name, arguments: args } = params;

    switch (name) {
      case 'screenshot':
        return await this.takeScreenshot(args);
      case 'test':
        return await this.runTest(args);
      case 'interact':
        return await this.interact(args);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  // ブラウザ起動（安定化）
  async launchBrowser() {
    if (!this.browser) {
      console.log('[MCP-HTTP] Launching browser...');
      this.browser = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox', 
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ]
      });
      console.log('[MCP-HTTP] Browser launched successfully');
    }
    return this.browser;
  }

  // スクリーンショット（改善版）
  async takeScreenshot(args) {
    const { 
      url, 
      filename,
      fullPage = true,
      viewport = { width: 1280, height: 720 }
    } = args;

    const browser = await this.launchBrowser();
    const page = await browser.newPage();
    
    try {
      await page.setViewportSize(viewport);
      console.log(`[MCP-HTTP] Navigating to ${url}`);
      await page.goto(url, { waitUntil: 'networkidle' });

      const timestamp = new Date().toISOString()
        .replace(/[:.]/g, '-')
        .replace('T', '_')
        .replace(/\..+/, '');
      
      const screenshotName = filename || `screenshot-${timestamp}.png`;
      const screenshotPath = path.join('./tests/screenshots', screenshotName);

      // ディレクトリ確保
      await fs.mkdir('./tests/screenshots', { recursive: true });

      console.log(`[MCP-HTTP] Taking screenshot: ${screenshotPath}`);
      const buffer = await page.screenshot({ 
        path: screenshotPath, 
        fullPage 
      });

      return {
        content: [
          {
            type: "text",
            text: `スクリーンショットを撮影しました: ${screenshotPath}`
          },
          {
            type: "image",
            data: buffer.toString('base64'),
            mimeType: "image/png"
          }
        ]
      };
    } catch (error) {
      console.error(`[MCP-HTTP] Screenshot error:`, error);
      throw error;
    } finally {
      await page.close();
    }
  }

  // テスト実行（改善版）
  async runTest(args) {
    const { config = './playwright.config.ts', testPattern = '' } = args;
    
    return new Promise((resolve, reject) => {
      const { spawn } = require('child_process');
      
      let command = ['npx', 'playwright', 'test'];
      if (config) command.push('--config', config);
      if (testPattern) command.push(testPattern);
      
      console.log(`[MCP-HTTP] Running test: ${command.join(' ')}`);

      const testProcess = spawn(command[0], command.slice(1), {
        cwd: './tests/playwright-mcp',
        stdio: 'pipe'
      });

      let stdout = '';
      let stderr = '';

      testProcess.stdout.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        console.log(`[TEST-OUT] ${output.trim()}`);
      });

      testProcess.stderr.on('data', (data) => {
        const output = data.toString();
        stderr += output;
        console.log(`[TEST-ERR] ${output.trim()}`);
      });

      testProcess.on('close', (code) => {
        console.log(`[MCP-HTTP] Test completed with exit code: ${code}`);
        resolve({
          content: [{
            type: "text",
            text: `テスト実行完了 (exit code: ${code})\n\n=== STDOUT ===\n${stdout}\n\n=== STDERR ===\n${stderr}`
          }]
        });
      });

      testProcess.on('error', (error) => {
        console.error(`[MCP-HTTP] Test process error:`, error);
        reject(error);
      });
    });
  }

  // 要素操作（簡易版）
  async interact(args) {
    const { url, actions = [] } = args;

    const browser = await this.launchBrowser();
    const page = await browser.newPage();
    
    try {
      console.log(`[MCP-HTTP] Interacting with ${url}`);
      await page.goto(url, { waitUntil: 'networkidle' });

      const results = [];
      for (const action of actions) {
        console.log(`[MCP-HTTP] Action: ${action.type}`);
        let result = null;
        
        switch (action.type) {
          case 'click':
            await page.click(action.selector);
            result = { type: 'click', selector: action.selector, success: true };
            break;
            
          case 'fill':
            await page.fill(action.selector, action.value);
            result = { type: 'fill', selector: action.selector, value: action.value, success: true };
            break;
            
          case 'wait':
            if (action.selector) {
              await page.waitForSelector(action.selector, { timeout: action.timeout || 5000 });
            } else {
              await page.waitForTimeout(action.timeout || 1000);
            }
            result = { type: 'wait', success: true };
            break;
            
          case 'getText':
            const text = await page.textContent(action.selector);
            result = { type: 'getText', selector: action.selector, text, success: true };
            break;
        }
        
        results.push(result);
      }

      return {
        content: [{
          type: "text",
          text: `操作完了: ${JSON.stringify(results, null, 2)}`
        }]
      };
    } catch (error) {
      console.error(`[MCP-HTTP] Interaction error:`, error);
      throw error;
    } finally {
      await page.close();
    }
  }

  // クリーンアップ
  async close() {
    console.log('[MCP-HTTP] Shutting down...');
    
    if (this.page) {
      await this.page.close();
      this.page = null;
    }
    
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
    
    if (this.server) {
      this.server.close();
      this.server = null;
    }
  }
}

// メイン処理
async function main() {
  const server = new MCPPlaywrightHTTPServer();
  const port = process.env.MCP_PORT || 3001;
  
  // シグナルハンドリング
  process.on('SIGINT', async () => {
    console.log('[MCP-HTTP] SIGINT received');
    await server.close();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('[MCP-HTTP] SIGTERM received');
    await server.close();
    process.exit(0);
  });
  
  // プロセス例外ハンドリング
  process.on('uncaughtException', (error) => {
    console.error('[MCP-HTTP] Uncaught exception:', error);
    server.close().finally(() => process.exit(1));
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('[MCP-HTTP] Unhandled rejection at:', promise, 'reason:', reason);
    server.close().finally(() => process.exit(1));
  });
  
  try {
    await server.start(port);
    console.log(`[MCP-HTTP] Server running on port ${port}`);
    
    // Keep alive
    setInterval(() => {
      console.log(`[MCP-HTTP] Keep alive - ${new Date().toISOString()}`);
    }, 30000);
    
  } catch (error) {
    console.error('[MCP-HTTP] Failed to start server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = MCPPlaywrightHTTPServer;