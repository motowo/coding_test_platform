#!/usr/bin/env node

/**
 * MCP Playwright Server
 * Claude Code 用の Model Context Protocol 対応 Playwright サーバー
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

// MCP Protocol implementation
class MCPPlaywrightServer {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  // MCP プロトコルハンドラー
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
    
    // JSON-RPC 2.0 形式のレスポンスを構築
    const response = {
      jsonrpc: "2.0",
      id: id,
      result: result
    };
    
    return response;
  }

  // 初期化
  async initialize(params) {
    // Claude Codeから送られてくるバージョンに対応
    const supportedVersions = ["2024-11-05", "2025-06-18"];
    const requestedVersion = params.protocolVersion;
    
    // サポートするバージョンの中から適切なものを選択
    const protocolVersion = supportedVersions.includes(requestedVersion) 
      ? requestedVersion 
      : "2024-11-05";
    
    return {
      protocolVersion: protocolVersion,
      capabilities: {
        tools: {}
      },
      serverInfo: {
        name: "playwright-mcp-server",
        version: "1.0.0"
      }
    };
  }

  // 利用可能なツールをリスト
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
              selector: {
                type: "string",
                description: "特定要素のセレクター（オプション）"
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
          name: "interact",
          description: "ウェブページ要素との相互作用",
          inputSchema: {
            type: "object",
            properties: {
              url: {
                type: "string",
                description: "操作するページのURL"
              },
              actions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: { 
                      type: "string", 
                      enum: ["click", "fill", "wait", "getText", "getAttribute"]
                    },
                    selector: { type: "string" },
                    value: { type: "string" },
                    attribute: { type: "string" },
                    timeout: { type: "number", default: 5000 }
                  },
                  required: ["type"]
                }
              }
            },
            required: ["url", "actions"]
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
                default: "./playwright.config.js"
              },
              testFiles: {
                type: "array",
                items: { type: "string" },
                description: "実行するテストファイル"
              }
            }
          }
        },
        {
          name: "assert",
          description: "ウェブページに対するアサーション",
          inputSchema: {
            type: "object",
            properties: {
              url: {
                type: "string",
                description: "検証するページのURL"
              },
              assertions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: { 
                      type: "string", 
                      enum: ["text", "visible", "count", "status"]
                    },
                    selector: { type: "string" },
                    expected: { type: ["string", "number", "boolean"] }
                  },
                  required: ["type"]
                }
              }
            },
            required: ["url", "assertions"]
          }
        }
      ]
    };
  }

  // ツール呼び出し
  async callTool(params) {
    const { name, arguments: args } = params;

    switch (name) {
      case 'screenshot':
        return await this.takeScreenshot(args);
      case 'interact':
        return await this.interact(args);
      case 'test':
        return await this.runTest(args);
      case 'assert':
        return await this.runAssertions(args);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  // ブラウザ起動
  async launchBrowser() {
    if (!this.browser) {
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
          '--disable-gpu'
        ]
      });
    }
    return this.browser;
  }

  // スクリーンショット撮影
  async takeScreenshot(args) {
    const { 
      url, 
      selector = null,
      fullPage = true,
      viewport = { width: 1280, height: 720 }
    } = args;

    const browser = await this.launchBrowser();
    const page = await browser.newPage();
    
    try {
      await page.setViewportSize(viewport);
      await page.goto(url, { waitUntil: 'networkidle' });

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const screenshotPath = `./tests/screenshots/capture-${timestamp}.png`;

      let buffer;
      if (selector) {
        const element = await page.locator(selector);
        buffer = await element.screenshot({ path: screenshotPath });
      } else {
        buffer = await page.screenshot({ 
          path: screenshotPath, 
          fullPage 
        });
      }

      await page.close();

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
      await page.close();
      throw error;
    }
  }

  // 要素との相互作用
  async interact(args) {
    const { url, actions } = args;

    const browser = await this.launchBrowser();
    const page = await browser.newPage();
    
    try {
      await page.goto(url, { waitUntil: 'networkidle' });

      const results = [];
      for (const action of actions) {
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
            
          case 'getAttribute':
            const attr = await page.getAttribute(action.selector, action.attribute);
            result = { type: 'getAttribute', selector: action.selector, attribute: action.attribute, value: attr, success: true };
            break;
        }
        
        results.push(result);
      }

      await page.close();

      return {
        content: [{
          type: "text",
          text: `操作完了: ${JSON.stringify(results, null, 2)}`
        }]
      };
    } catch (error) {
      await page.close();
      throw error;
    }
  }

  // テスト実行
  async runTest(args) {
    const { config = './playwright.config.js', testFiles = [] } = args;
    
    return new Promise((resolve, reject) => {
      const { spawn } = require('child_process');
      
      let command = ['npx', 'playwright', 'test'];
      if (config) command.push('--config', config);
      if (testFiles.length > 0) command.push(...testFiles);

      const testProcess = spawn(command[0], command.slice(1), {
        cwd: process.cwd(),
        stdio: 'pipe'
      });

      let stdout = '';
      let stderr = '';

      testProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      testProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      testProcess.on('close', (code) => {
        resolve({
          content: [{
            type: "text",
            text: `テスト実行完了 (exit code: ${code})\n\n=== STDOUT ===\n${stdout}\n\n=== STDERR ===\n${stderr}`
          }]
        });
      });

      testProcess.on('error', (error) => {
        reject(error);
      });
    });
  }

  // アサーション実行
  async runAssertions(args) {
    const { url, assertions } = args;

    const browser = await this.launchBrowser();
    const page = await browser.newPage();
    
    try {
      await page.goto(url, { waitUntil: 'networkidle' });

      const results = [];
      for (const assertion of assertions) {
        let result = null;
        
        try {
          switch (assertion.type) {
            case 'text':
              const text = await page.textContent(assertion.selector);
              const textMatch = text?.includes(assertion.expected);
              result = { 
                type: 'text', 
                selector: assertion.selector, 
                expected: assertion.expected,
                actual: text,
                success: textMatch 
              };
              break;
              
            case 'visible':
              const isVisible = await page.isVisible(assertion.selector);
              result = { 
                type: 'visible', 
                selector: assertion.selector, 
                success: isVisible 
              };
              break;
              
            case 'count':
              const count = await page.locator(assertion.selector).count();
              const countMatch = count === assertion.expected;
              result = { 
                type: 'count', 
                selector: assertion.selector, 
                expected: assertion.expected,
                actual: count,
                success: countMatch 
              };
              break;
          }
        } catch (error) {
          result = { 
            type: assertion.type, 
            success: false, 
            error: error.message 
          };
        }
        
        results.push(result);
      }

      await page.close();

      const allPassed = results.every(r => r.success);
      return {
        content: [{
          type: "text", 
          text: `アサーション結果 (全${results.length}件, ${allPassed ? '成功' : '失敗'}): \n${JSON.stringify(results, null, 2)}`
        }]
      };
    } catch (error) {
      await page.close();
      throw error;
    }
  }

  // クリーンアップ
  async close() {
    if (this.page) {
      await this.page.close();
      this.page = null;
    }
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

// MCPサーバーメイン処理
async function main() {
  const server = new MCPPlaywrightServer();
  
  // デバッグログを stderr に出力（stdio通信を妨げない）
  const debug = (msg) => process.stderr.write(`[MCP-DEBUG] ${new Date().toISOString()} ${msg}\n`);
  debug('MCP Playwright Server starting...');

  // stdin/stdoutのセットアップを確実に行う
  process.stdin.setEncoding('utf8');
  process.stdout.setEncoding('utf8');
  process.stdin.resume(); // stdinを明示的に開始
  
  debug('Input/output encoding set to utf8');

  let buffer = '';
  
  // 少し遅延を設けてから準備完了をログ出力
  await new Promise(resolve => setTimeout(resolve, 100));

  process.stdin.on('data', async (chunk) => {
    debug(`Received data chunk: ${JSON.stringify(chunk)}`);
    buffer += chunk;
    
    while (true) {
      const newlineIndex = buffer.indexOf('\n');
      if (newlineIndex === -1) break;
      
      const line = buffer.slice(0, newlineIndex);
      buffer = buffer.slice(newlineIndex + 1);
      
      if (line.trim()) {
        debug(`Processing line: ${JSON.stringify(line)}`);
        let request = null;
        try {
          request = JSON.parse(line);
          debug(`Parsed request: ${JSON.stringify(request)}`);
          const response = await server.handleRequest(request);
          
          const responseStr = JSON.stringify(response) + '\n';
          debug(`Sending response: ${JSON.stringify(responseStr)}`);
          process.stdout.write(responseStr);
        } catch (error) {
          debug(`Error processing request: ${error.message}`);
          // requestが未定義の場合があるので、安全にアクセス
          let requestId = null;
          if (request !== null && typeof request === 'object') {
            requestId = request.id || null;
          }
          const errorResponse = {
            jsonrpc: "2.0",
            id: requestId,
            error: {
              code: -32603,
              message: error.message,
              data: error.stack
            }
          };
          process.stdout.write(JSON.stringify(errorResponse) + '\n');
        }
      }
    }
  });

  process.stdin.on('end', async () => {
    debug('stdin end event received');
    await server.close();
    process.exit(0);
  });

  // シグナルハンドリング
  process.on('SIGINT', async () => {
    debug('SIGINT received');
    await server.close();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    debug('SIGTERM received');
    await server.close();
    process.exit(0);
  });
  
  debug('Server ready and listening on stdin');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = MCPPlaywrightServer;