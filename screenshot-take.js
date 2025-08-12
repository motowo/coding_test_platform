const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function takeScreenshot(url, basename) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto(url, { waitUntil: 'networkidle' });
    
    const timestamp = new Date().toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}Z$/, '')
      .slice(0, 15);
    
    const filename = `${timestamp}_${basename}.png`;
    const filepath = path.join('/workspace/screenshot', filename);
    
    // Ensure screenshot directory exists
    fs.mkdirSync(path.dirname(filepath), { recursive: true });
    
    await page.screenshot({ 
      path: filepath,
      fullPage: true 
    });
    
    console.log(`Screenshot saved: ${filepath}`);
    
  } catch (error) {
    console.error('Error taking screenshot:', error);
  } finally {
    await browser.close();
  }
}

// Command line usage: node screenshot-take.js <URL> <basename>
if (require.main === module) {
  const [,, url, basename] = process.argv;
  if (!url || !basename) {
    console.error('Usage: node screenshot-take.js <URL> <basename>');
    process.exit(1);
  }
  takeScreenshot(url, basename);
}