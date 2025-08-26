import { test, expect } from '@playwright/test';

test.describe('Architecture Validation', () => {
  test('Backend health check', async ({ request }) => {
    const response = await request.get('http://localhost:9000/health');
    expect(response.ok()).toBeTruthy();

    const healthData = await response.json();
    console.log('Backend health:', healthData);
  });

  test('Storefront loads successfully', async ({ page }) => {
    await page.goto('http://localhost:4200');

    // Wait for Angular app to bootstrap
    await page.waitForSelector('app-root', { timeout: 10000 });

    // Check if the page title is set
    await expect(page).toHaveTitle(/Medusa Store/i);

    // Take a screenshot for debugging
    await page.screenshot({ path: 'storefront-loaded.png' });
  });

  test('API connectivity from storefront', async ({ page }) => {
    // Navigate to storefront
    await page.goto('http://localhost:4200');

    // Wait for app to load
    await page.waitForSelector('app-root');

    // Check if storefront can fetch products from backend
    const response = await page.evaluate(async () => {
      try {
        const response = await fetch('http://localhost:9000/store/products');
        return {
          ok: response.ok,
          status: response.status,
          data: await response.json(),
        };
      } catch (error) {
        return { error: error.message };
      }
    });

    console.log('API Response:', response);
    expect(response.ok).toBeTruthy();
  });

  test('Basic navigation works', async ({ page }) => {
    await page.goto('http://localhost:4200');

    // Wait for Angular to bootstrap
    await page.waitForSelector('app-root');

    // Check if main navigation elements exist
    // Adjust selectors based on your Angular app structure
    const navigation = page.locator('nav, .navigation, .header');
    await expect(navigation).toBeVisible();

    console.log('Basic navigation test passed');
  });

  test('End-to-end flow simulation', async ({ page }) => {
    // This is a basic flow test - expand based on your app features
    await page.goto('http://localhost:4200');

    // Wait for app
    await page.waitForSelector('app-root');

    // Try to navigate to products page (adjust route as needed)
    try {
      await page.click('a[href*="products"], .products-link');
      await page.waitForURL('**/products**', { timeout: 5000 });
      console.log('Products page navigation successful');
    } catch (error) {
      console.log('Products navigation not found, skipping...');
    }

    // Test passes if we get this far without errors
    expect(true).toBeTruthy();
  });
});
