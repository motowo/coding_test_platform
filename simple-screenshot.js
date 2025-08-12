#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function takeScreenshot(url, basename) {
  console.log(`[Screenshot] Starting screenshot for ${url}`);
  
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security'
    ]
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    
    console.log(`[Screenshot] Navigating to ${url}...`);
    await page.goto(url, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });

    // Ensure screenshot directory exists
    const screenshotDir = './screenshot';
    fs.mkdirSync(screenshotDir, { recursive: true });

    // Generate filename with timestamp
    const timestamp = new Date().toISOString()
      .replace(/[-:T]/g, '')
      .replace(/\.\d{3}Z$/, '');
    
    const filename = `${timestamp}_${basename}.png`;
    const filepath = path.join(screenshotDir, filename);

    console.log(`[Screenshot] Taking screenshot...`);
    await page.screenshot({
      path: filepath,
      fullPage: true
    });

    console.log(`[Screenshot] Success: ${filepath}`);
    return filepath;

  } catch (error) {
    console.error(`[Screenshot] Error: ${error.message}`);
    throw error;
  } finally {
    await browser.close();
  }
}

// CLI usage
if (require.main === module) {
  const [,, url, basename] = process.argv;
  
  if (!url || !basename) {
    console.error('Usage: node simple-screenshot.js <URL> <basename>');
    process.exit(1);
  }

  takeScreenshot(url, basename)
    .then((filepath) => {
      console.log(`Screenshot saved: ${filepath}`);
    })
    .catch((error) => {
      console.error(`Failed to take screenshot: ${error.message}`);
      process.exit(1);
    });
}

module.exports = takeScreenshot;