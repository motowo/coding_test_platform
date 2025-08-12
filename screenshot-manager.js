#!/usr/bin/env node

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

class ScreenshotManager {
  constructor() {
    this.browser = null;
    this.screenshotDir = '/workspace/screenshot';
  }

  async init() {
    console.log('[Screenshot] Initializing browser...');
    this.browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });
    console.log('[Screenshot] Browser initialized');
  }

  async takeScreenshot(url, basename, options = {}) {
    if (!this.browser) {
      await this.init();
    }

    const page = await this.browser.newPage({
      viewport: { width: 1280, height: 720 },
      ...options.viewport
    });

    try {
      console.log(`[Screenshot] Navigating to ${url}...`);
      await page.goto(url, { 
        waitUntil: 'networkidle',
        timeout: 30000
      });

      // Ensure screenshot directory exists
      fs.mkdirSync(this.screenshotDir, { recursive: true });

      // Generate timestamp filename
      const timestamp = new Date().toISOString()
        .replace(/[-:]/g, '')
        .replace(/\.\d{3}Z$/, '')
        .slice(0, 15);
      
      const filename = `${timestamp}_${basename}.png`;
      const filepath = path.join(this.screenshotDir, filename);

      console.log(`[Screenshot] Taking screenshot...`);
      await page.screenshot({
        path: filepath,
        fullPage: options.fullPage !== false,
        ...options.screenshot
      });

      console.log(`[Screenshot] Screenshot saved: ${filepath}`);
      return filepath;

    } catch (error) {
      console.error(`[Screenshot] Error taking screenshot: ${error.message}`);
      throw error;
    } finally {
      await page.close();
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      console.log('[Screenshot] Browser closed');
    }
  }
}

// CLI Usage
if (require.main === module) {
  const command = process.argv[2];
  const url = process.argv[3];
  const basename = process.argv[4];

  if (command !== 'take' || !url || !basename) {
    console.error('Usage: node screenshot-manager.js take <URL> <basename>');
    process.exit(1);
  }

  const manager = new ScreenshotManager();
  
  manager.takeScreenshot(url, basename)
    .then((filepath) => {
      console.log(`Success: ${filepath}`);
      return manager.close();
    })
    .catch((error) => {
      console.error(`Failed: ${error.message}`);
      return manager.close().then(() => process.exit(1));
    });
}

module.exports = ScreenshotManager;