import { test, expect } from '@playwright/test';

test.describe('Chapter List Page', () => {
  test('should render header and tabs correctly', async ({ page }) => {
    await page.goto('/biology');

    // Header checks
    await expect(page.locator('h1')).toHaveText('Biology');
    await expect(page.locator('button[aria-label="Go back"]')).toBeVisible();
    await expect(page.locator('button[aria-label="Search"]')).toBeVisible();

    // Tab checks
    const tabs = ['Chapters', 'NCERT', 'Notes', 'PYQs', 'Tests'];
    for (const tab of tabs) {
      await expect(page.locator(`text=${tab}`)).toBeVisible();
    }
  });

  test('should render the chapter list with correct statuses', async ({ page }) => {
    await page.goto('/biology');

    // Check for some specific chapters
    await expect(page.locator('h2:has-text("The Living World")')).toBeVisible();
    await expect(page.locator('text=100% Completed')).toBeVisible();

    await expect(page.locator('h2:has-text("Plant Kingdom")')).toBeVisible();
    await expect(page.locator('text=Not Started').first()).toBeVisible();

    // Check that there are 10 chapters
    const chapters = await page.locator('h2').count();
    expect(chapters).toBe(10);
  });

  test('should display the continue learning button', async ({ page }) => {
    await page.goto('/biology');

    const button = page.locator('button:has-text("Continue Learning")');
    await expect(button).toBeVisible();
  });
});
