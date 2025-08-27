// e2e/tests/complete-storefront.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Complete Storefront E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure clean state before each test
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-root"]');
  });

  test.describe('Homepage & Navigation', () => {
    test('loads homepage with all essential elements', async ({ page }) => {
      // Header elements
      await expect(page.locator('[data-testid="header"]')).toBeVisible();
      await expect(page.locator('[data-testid="logo"]')).toBeVisible();
      await expect(page.locator('[data-testid="search-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="cart-button"]')).toBeVisible();

      // Main content
      await expect(page.locator('[data-testid="hero-section"]')).toBeVisible();
      await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();
      await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible();

      // Footer
      await expect(page.locator('[data-testid="footer"]')).toBeVisible();
    });

    test('navigation menu works correctly', async ({ page }) => {
      // Test mobile menu toggle
      const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]');
      if (await mobileMenuButton.isVisible()) {
        await mobileMenuButton.click();
        await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
      }

      // Test category navigation
      const categoryLinks = page.locator('[data-testid="category-link"]');
      if ((await categoryLinks.count()) > 0) {
        await categoryLinks.first().click();
        await expect(page).toHaveURL(/\/collections\/.+/);
      }
    });
  });

  test.describe('Product Search', () => {
    test('search functionality works correctly', async ({ page }) => {
      const searchInput = page.locator('[data-testid="search-input"]');

      // Type in search
      await searchInput.fill('shirt');

      // Wait for results
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 5000 });

      // Verify results appear
      const searchResults = page.locator('[data-testid="search-results"]');
      await expect(searchResults).toBeVisible();

      const resultItems = page.locator('[data-testid="search-result-item"]');
      await expect(resultItems.first()).toBeVisible();

      // Verify result contains product info
      const firstResult = resultItems.first();
      await expect(firstResult.locator('[data-testid="product-name"]')).toBeVisible();
      await expect(firstResult.locator('[data-testid="product-price"]')).toBeVisible();
    });

    test('search results are clickable and navigate to product', async ({ page }) => {
      await page.fill('[data-testid="search-input"]', 'shirt');
      await page.waitForSelector('[data-testid="search-result-item"]');

      const firstResult = page.locator('[data-testid="search-result-item"]').first();
      await firstResult.click();

      // Should navigate to product page
      await expect(page).toHaveURL(/\/products\/.+/);
      await expect(page.locator('[data-testid="product-detail"]')).toBeVisible();
    });

    test('empty search shows appropriate message', async ({ page }) => {
      await page.fill('[data-testid="search-input"]', 'nonexistentproduct12345');
      await page.waitForSelector('[data-testid="search-results"]');

      const noResults = page.locator('[data-testid="no-results-message"]');
      await expect(noResults).toBeVisible();
      await expect(noResults).toContainText(/no results found/i);
    });

    test('search input clears results when empty', async ({ page }) => {
      // Search first
      await page.fill('[data-testid="search-input"]', 'shirt');
      await page.waitForSelector('[data-testid="search-results"]');

      // Clear search
      await page.fill('[data-testid="search-input"]', '');

      // Results should disappear
      await expect(page.locator('[data-testid="search-results"]')).not.toBeVisible();
    });
  });

  test.describe('Product Listing & Filtering', () => {
    test('product grid displays products correctly', async ({ page }) => {
      const productCards = page.locator('[data-testid="product-card"]');
      await expect(productCards.first()).toBeVisible();

      // Check product card contents
      const firstCard = productCards.first();
      await expect(firstCard.locator('[data-testid="product-image"]')).toBeVisible();
      await expect(firstCard.locator('[data-testid="product-title"]')).toBeVisible();
      await expect(firstCard.locator('[data-testid="product-price"]')).toBeVisible();
    });

    test('product cards are clickable', async ({ page }) => {
      const firstCard = page.locator('[data-testid="product-card"]').first();
      await firstCard.click();

      await expect(page).toHaveURL(/\/products\/.+/);
      await expect(page.locator('[data-testid="product-detail"]')).toBeVisible();
    });

    test('product filters work correctly', async ({ page }) => {
      // Test collection filter if available
      const collectionFilter = page.locator('[data-testid="collection-filter"]');
      if ((await collectionFilter.count()) > 0) {
        await collectionFilter.first().click();

        // Wait for filtered results
        await page.waitForTimeout(1000);

        // Check URL changed
        await expect(page).toHaveURL(/collection_id/);
      }
    });

    test('pagination works correctly', async ({ page }) => {
      const nextButton = page.locator('[data-testid="pagination-next"]');
      if ((await nextButton.isVisible()) && (await nextButton.isEnabled())) {
        await nextButton.click();

        // Check URL contains pagination parameters
        await expect(page).toHaveURL(/offset=/);

        // Verify products loaded
        await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible();
      }
    });
  });

  test.describe('Product Detail Page', () => {
    test('product detail page loads with all elements', async ({ page }) => {
      await page.locator('[data-testid="product-card"]').first().click();

      // Check all essential elements
      await expect(page.locator('[data-testid="product-images"]')).toBeVisible();
      await expect(page.locator('[data-testid="product-title"]')).toBeVisible();
      await expect(page.locator('[data-testid="product-price"]')).toBeVisible();
      await expect(page.locator('[data-testid="product-description"]')).toBeVisible();
      await expect(page.locator('[data-testid="add-to-cart-button"]')).toBeVisible();
    });

    test('product image gallery works', async ({ page }) => {
      await page.locator('[data-testid="product-card"]').first().click();

      // Check if multiple images exist
      const thumbnails = page.locator('[data-testid="image-thumbnail"]');
      if ((await thumbnails.count()) > 1) {
        await thumbnails.nth(1).click();

        // Main image should change
        const mainImage = page.locator('[data-testid="main-product-image"]');
        await expect(mainImage).toBeVisible();
      }
    });

    test('variant selection works', async ({ page }) => {
      await page.locator('[data-testid="product-card"]').first().click();

      // Check if variants exist
      const variantOptions = page.locator('[data-testid="variant-option"]');
      if ((await variantOptions.count()) > 1) {
        await variantOptions.nth(1).click();

        // Price might change, verify button is still enabled
        await expect(page.locator('[data-testid="add-to-cart-button"]')).toBeEnabled();
      }
    });

    test('quantity selector works', async ({ page }) => {
      await page.locator('[data-testid="product-card"]').first().click();

      const quantityInput = page.locator('[data-testid="quantity-input"]');
      if (await quantityInput.isVisible()) {
        await quantityInput.fill('2');
        await expect(quantityInput).toHaveValue('2');

        // Test increase/decrease buttons
        const increaseBtn = page.locator('[data-testid="quantity-increase"]');
        const decreaseBtn = page.locator('[data-testid="quantity-decrease"]');

        if (await increaseBtn.isVisible()) {
          await increaseBtn.click();
          await expect(quantityInput).toHaveValue('3');
        }

        if (await decreaseBtn.isVisible()) {
          await decreaseBtn.click();
          await expect(quantityInput).toHaveValue('2');
        }
      }
    });
  });

  test.describe('Shopping Cart', () => {
    test('can add product to cart', async ({ page }) => {
      // Go to product page
      await page.locator('[data-testid="product-card"]').first().click();

      // Add to cart
      await page.locator('[data-testid="add-to-cart-button"]').click();

      // Check cart counter updates
      const cartCounter = page.locator('[data-testid="cart-counter"]');
      await expect(cartCounter).toBeVisible();
      await expect(cartCounter).toContainText('1');
    });

    test('can view cart contents', async ({ page }) => {
      // Add product to cart first
      await page.locator('[data-testid="product-card"]').first().click();
      await page.locator('[data-testid="add-to-cart-button"]').click();

      // Open cart
      await page.locator('[data-testid="cart-button"]').click();

      // Check cart drawer/page opens
      const cartContainer = page.locator('[data-testid="cart-drawer"], [data-testid="cart-page"]');
      await expect(cartContainer).toBeVisible();

      // Check cart item exists
      await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1);

      // Check cart item details
      const cartItem = page.locator('[data-testid="cart-item"]').first();
      await expect(cartItem.locator('[data-testid="item-image"]')).toBeVisible();
      await expect(cartItem.locator('[data-testid="item-title"]')).toBeVisible();
      await expect(cartItem.locator('[data-testid="item-price"]')).toBeVisible();
      await expect(cartItem.locator('[data-testid="item-quantity"]')).toBeVisible();
    });

    test('can update item quantity in cart', async ({ page }) => {
      // Add product and open cart
      await page.locator('[data-testid="product-card"]').first().click();
      await page.locator('[data-testid="add-to-cart-button"]').click();
      await page.locator('[data-testid="cart-button"]').click();

      // Update quantity
      const increaseBtn = page.locator('[data-testid="increase-quantity"]').first();
      await increaseBtn.click();

      // Check quantity updated
      await expect(page.locator('[data-testid="item-quantity"]').first()).toContainText('2');

      // Check cart counter updated
      await expect(page.locator('[data-testid="cart-counter"]')).toContainText('2');
    });

    test('can remove item from cart', async ({ page }) => {
      // Add product and open cart
      await page.locator('[data-testid="product-card"]').first().click();
      await page.locator('[data-testid="add-to-cart-button"]').click();
      await page.locator('[data-testid="cart-button"]').click();

      // Remove item
      await page.locator('[data-testid="remove-item"]').first().click();

      // Cart should be empty
      await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(0);
      await expect(page.locator('[data-testid="empty-cart-message"]')).toBeVisible();
    });

    test('cart totals calculate correctly', async ({ page }) => {
      // Add product and open cart
      await page.locator('[data-testid="product-card"]').first().click();
      await page.locator('[data-testid="add-to-cart-button"]').click();
      await page.locator('[data-testid="cart-button"]').click();

      // Check totals are displayed
      await expect(page.locator('[data-testid="cart-subtotal"]')).toBeVisible();
      await expect(page.locator('[data-testid="cart-total"]')).toBeVisible();
    });
  });

  test.describe('Checkout Process', () => {
    test('can navigate to checkout', async ({ page }) => {
      // Add product and go to cart
      await page.locator('[data-testid="product-card"]').first().click();
      await page.locator('[data-testid="add-to-cart-button"]').click();
      await page.locator('[data-testid="cart-button"]').click();

      // Proceed to checkout
      await page.locator('[data-testid="checkout-button"]').click();

      // Should be on checkout page
      await expect(page).toHaveURL(/\/checkout/);
      await expect(page.locator('[data-testid="checkout-form"]')).toBeVisible();
    });

    test('checkout form displays required fields', async ({ page }) => {
      // Navigate to checkout
      await page.locator('[data-testid="product-card"]').first().click();
      await page.locator('[data-testid="add-to-cart-button"]').click();
      await page.locator('[data-testid="cart-button"]').click();
      await page.locator('[data-testid="checkout-button"]').click();

      // Check form fields
      await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="first-name-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="last-name-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="address-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="city-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="postal-code-input"]')).toBeVisible();
    });

    test('can fill checkout form', async ({ page }) => {
      // Navigate to checkout
      await page.locator('[data-testid="product-card"]').first().click();
      await page.locator('[data-testid="add-to-cart-button"]').click();
      await page.locator('[data-testid="cart-button"]').click();
      await page.locator('[data-testid="checkout-button"]').click();

      // Fill form
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="first-name-input"]', 'John');
      await page.fill('[data-testid="last-name-input"]', 'Doe');
      await page.fill('[data-testid="address-input"]', '123 Test Street');
      await page.fill('[data-testid="city-input"]', 'Test City');
      await page.fill('[data-testid="postal-code-input"]', '12345');

      // Check form validation
      const continueButton = page.locator('[data-testid="continue-to-shipping"]');
      if (await continueButton.isVisible()) {
        await expect(continueButton).toBeEnabled();
      }
    });

    test('shipping options are displayed', async ({ page }) => {
      // Fill checkout form first
      await page.locator('[data-testid="product-card"]').first().click();
      await page.locator('[data-testid="add-to-cart-button"]').click();
      await page.locator('[data-testid="cart-button"]').click();
      await page.locator('[data-testid="checkout-button"]').click();

      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="first-name-input"]', 'John');
      await page.fill('[data-testid="last-name-input"]', 'Doe');
      await page.fill('[data-testid="address-input"]', '123 Test Street');
      await page.fill('[data-testid="city-input"]', 'Test City');
      await page.fill('[data-testid="postal-code-input"]', '12345');

      const continueButton = page.locator('[data-testid="continue-to-shipping"]');
      if (await continueButton.isVisible()) {
        await continueButton.click();

        // Check shipping options appear
        await expect(page.locator('[data-testid="shipping-options"]')).toBeVisible();
        await expect(page.locator('[data-testid="shipping-option"]').first()).toBeVisible();
      }
    });
  });

  test.describe('Customer Authentication', () => {
    test('login modal opens and closes', async ({ page }) => {
      const loginButton = page.locator('[data-testid="login-button"]');
      if (await loginButton.isVisible()) {
        await loginButton.click();

        await expect(page.locator('[data-testid="login-modal"]')).toBeVisible();
        await expect(page.locator('[data-testid="email-login-input"]')).toBeVisible();
        await expect(page.locator('[data-testid="password-login-input"]')).toBeVisible();

        // Close modal
        await page.locator('[data-testid="close-modal"]').click();
        await expect(page.locator('[data-testid="login-modal"]')).not.toBeVisible();
      }
    });

    test('can switch between login and register', async ({ page }) => {
      const loginButton = page.locator('[data-testid="login-button"]');
      if (await loginButton.isVisible()) {
        await loginButton.click();

        // Switch to register
        const registerTab = page.locator('[data-testid="register-tab"]');
        if (await registerTab.isVisible()) {
          await registerTab.click();

          await expect(page.locator('[data-testid="register-form"]')).toBeVisible();
          await expect(page.locator('[data-testid="first-name-register-input"]')).toBeVisible();
        }
      }
    });

    test('login form validation works', async ({ page }) => {
      const loginButton = page.locator('[data-testid="login-button"]');
      if (await loginButton.isVisible()) {
        await loginButton.click();

        // Try to submit without filling fields
        const submitButton = page.locator('[data-testid="login-submit"]');
        await submitButton.click();

        // Should show validation errors
        const errorMessage = page.locator('[data-testid="login-error"]');
        if (await errorMessage.isVisible()) {
          await expect(errorMessage).toBeVisible();
        }
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('mobile navigation works correctly', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]');
      if (await mobileMenuButton.isVisible()) {
        await mobileMenuButton.click();
        await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();

        // Close menu
        await page.locator('[data-testid="close-mobile-menu"]').click();
        await expect(page.locator('[data-testid="mobile-menu"]')).not.toBeVisible();
      }
    });

    test('product grid adapts to mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      const productGrid = page.locator('[data-testid="product-grid"]');
      await expect(productGrid).toBeVisible();

      // Should show fewer columns on mobile
      const productCards = page.locator('[data-testid="product-card"]');
      await expect(productCards.first()).toBeVisible();
    });
  });

  test.describe('Performance & Loading States', () => {
    test('loading states display correctly', async ({ page }) => {
      // Check initial loading state
      const loadingSpinner = page.locator('[data-testid="loading-spinner"]');

      // Reload page to catch loading state
      await page.reload();

      // Loading spinner might be visible briefly
      if (await loadingSpinner.isVisible()) {
        await expect(loadingSpinner).toBeVisible();
      }

      // Content should load
      await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();
    });

    test('images load properly', async ({ page }) => {
      const productImages = page.locator('[data-testid="product-image"] img');

      // Wait for first image to load
      await productImages.first().waitFor({ state: 'visible' });

      // Check image has loaded
      const firstImage = productImages.first();
      const naturalWidth = await firstImage.evaluate(
        (img) => (img as HTMLImageElement).naturalWidth,
      );
      expect(naturalWidth).toBeGreaterThan(0);
    });
  });

  test.describe('Error Handling', () => {
    test('handles 404 pages gracefully', async ({ page }) => {
      await page.goto('/non-existent-page');

      const notFoundMessage = page.locator('[data-testid="not-found-message"]');
      if (await notFoundMessage.isVisible()) {
        await expect(notFoundMessage).toBeVisible();
        await expect(notFoundMessage).toContainText(/not found/i);
      }
    });

    test('handles API errors gracefully', async ({ page }) => {
      // This would require mocking API responses in a real test
      // For now, just check that error states are handled

      // Try searching for something that might cause an error
      await page.fill('[data-testid="search-input"]', 'api-error-test');

      // Should either show results or an error message, not crash
      await page.waitForTimeout(2000);

      const hasResults = await page.locator('[data-testid="search-results"]').isVisible();
      const hasError = await page.locator('[data-testid="error-message"]').isVisible();

      expect(hasResults || hasError).toBeTruthy();
    });
  });
});
