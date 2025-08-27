import { test, expect } from '@playwright/test';

test.describe('Product Search', () => {
  test('Search input is visible on homepage', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('app-root');

    const searchInput = page.locator('[data-testid="product-search-input"]');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute('placeholder', /search products/i);
  });

  test('User can search for products', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('app-root');

    // Type in search input
    await page.fill('[data-testid="product-search-input"]', 'shirt');

    // Wait for search results
    await page.waitForSelector('[data-testid="search-results"]');

    // Check if results container is visible
    const results = page.locator('[data-testid="search-results"]');
    await expect(results).toBeVisible();
  });

  test('Search shows "no results" message when nothing found', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('app-root');

    // Search for something that doesn't exist
    await page.fill('[data-testid="product-search-input"]', 'nonexistentproduct123');

    // Wait for no results message
    const noResults = page.locator('[data-testid="no-results-message"]');
    await expect(noResults).toBeVisible();
    await expect(noResults).toContainText(/no products found/i);
  });

  test('User can clear search results', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('app-root');

    // Search for something
    await page.fill('[data-testid="product-search-input"]', 'shirt');
    await page.waitForSelector('[data-testid="search-results"]');

    // Clear the search
    await page.fill('[data-testid="product-search-input"]', '');

    // Results should be hidden
    const results = page.locator('[data-testid="search-results"]');
    await expect(results).not.toBeVisible();
  });

  test('Search results show product details', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('app-root');

    // Search for products
    await page.fill('[data-testid="product-search-input"]', 'shirt');
    await page.waitForSelector('[data-testid="search-results"]');

    // Check if product cards are displayed
    const productCard = page.locator('[data-testid="product-card"]').first();
    await expect(productCard).toBeVisible();

    // Check product card contents
    await expect(productCard.locator('[data-testid="product-title"]')).toBeVisible();
    await expect(productCard.locator('[data-testid="product-price"]')).toBeVisible();
    await expect(productCard.locator('[data-testid="product-image"]')).toBeVisible();
  });
});
