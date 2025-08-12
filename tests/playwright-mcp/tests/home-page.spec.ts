import { test, expect } from '@playwright/test';

test.describe('Home Page - T-002 Next.js Setup', () => {
  test('should render home page with correct title and content', async ({ page }) => {
    await page.goto('/');
    
    // Title verification
    await expect(page).toHaveTitle(/Coding Test Platform/);
    
    // Main heading verification
    await expect(page.locator('h1')).toContainText('コーディングテストプラットフォーム');
    
    // Setup completion message verification
    await expect(page.locator('p')).toContainText('環境セットアップが完了しました');
  });

  test('should have proper HTML structure', async ({ page }) => {
    await page.goto('/');
    
    // Check for proper HTML structure
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('main h1')).toBeVisible();
    await expect(page.locator('main p')).toBeVisible();
  });
});