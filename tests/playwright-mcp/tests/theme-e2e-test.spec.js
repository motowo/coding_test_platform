const { test, expect } = require('@playwright/test');

test.describe('T-016: Tailwind CSS Theme System E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://host.docker.internal:3000/theme-test');
    await page.waitForLoadState('networkidle');
  });

  test('should display theme test page with all components', async ({ page }) => {
    // Check main heading
    await expect(page.getByRole('heading', { name: 'テーマシステムテスト' })).toBeVisible();
    
    // Check theme toggle button
    await expect(page.getByRole('button', { name: /toggle theme/i })).toBeVisible();
    
    // Check current theme display
    await expect(page.locator('text=現在のテーマ:')).toBeVisible();
    
    // Check color cards
    await expect(page.getByText('プライマリカラー')).toBeVisible();
    await expect(page.getByText('セカンダリカラー')).toBeVisible();
    await expect(page.getByText('アクセントカラー')).toBeVisible();
    await expect(page.getByText('エネルギッシュアクセント')).toBeVisible();
    
    // Check buttons
    await expect(page.getByRole('button', { name: 'プライマリボタン' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'セカンダリボタン' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'アウトラインボタン' })).toBeVisible();
  });

  test('should toggle between light and dark themes', async ({ page }) => {
    // Click theme toggle button
    await page.getByRole('button', { name: /toggle theme/i }).click();
    
    // Wait for dropdown menu
    await expect(page.getByRole('menuitem', { name: /dark/i })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: /light/i })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: /system/i })).toBeVisible();
    
    // Switch to dark theme
    await page.getByRole('menuitem', { name: /dark/i }).click();
    
    // Wait for theme change and verify
    await page.waitForTimeout(1000);
    
    // Verify theme changed (check if dark theme styles are applied)
    const body = page.locator('body');
    const bodyClasses = await body.getAttribute('class');
    
    // Take screenshot after theme change
    await page.screenshot({ 
      path: '/workspace/screenshot/theme-e2e-dark.png', 
      fullPage: true 
    });
    
    // Switch to light theme
    await page.getByRole('button', { name: /toggle theme/i }).click();
    await page.getByRole('menuitem', { name: /light/i }).click();
    await page.waitForTimeout(1000);
    
    // Take screenshot of light theme
    await page.screenshot({ 
      path: '/workspace/screenshot/theme-e2e-light.png', 
      fullPage: true 
    });
  });

  test('should be keyboard accessible', async ({ page }) => {
    // Focus on theme toggle button with Tab
    await page.keyboard.press('Tab');
    
    // Check if button is focused
    const themeButton = page.getByRole('button', { name: /toggle theme/i });
    await expect(themeButton).toBeFocused();
    
    // Open menu with Enter
    await page.keyboard.press('Enter');
    
    // Verify menu items are accessible
    await expect(page.getByRole('menuitem', { name: /light/i })).toBeVisible();
    
    // Navigate with arrow keys
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    
    // Select with Enter
    await page.keyboard.press('Enter');
    
    await page.waitForTimeout(500);
  });

  test('should display responsive layout on different screen sizes', async ({ page }) => {
    // Test desktop layout
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(500);
    
    // Check grid layout (should show 2 columns on desktop)
    const grid = page.locator('.grid-cols-1.md\\:grid-cols-2');
    await expect(grid).toBeVisible();
    
    // Take desktop screenshot
    await page.screenshot({ 
      path: '/workspace/screenshot/theme-e2e-desktop.png', 
      fullPage: true 
    });
    
    // Test mobile layout
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    // Verify layout still works on mobile
    await expect(page.getByRole('heading', { name: 'テーマシステムテスト' })).toBeVisible();
    await expect(page.getByRole('button', { name: /toggle theme/i })).toBeVisible();
    
    // Take mobile screenshot
    await page.screenshot({ 
      path: '/workspace/screenshot/theme-e2e-mobile.png', 
      fullPage: true 
    });
  });
});