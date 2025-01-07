import { test, expect } from '@playwright/test';

test('create order in loop until successful', async ({ page }) => {
  let orderPlaced = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!orderPlaced && attempts < maxAttempts) {
    try {
      attempts++;
      console.log(`\nAttempt ${attempts} of ${maxAttempts}`);

      // Navigate to the homepage
      await page.goto('/');
      console.log('Navigated to homepage');
      
      // Wait for products to load
      await page.waitForSelector('.product-card', { timeout: 10000 });
      console.log('Products loaded');

      // Click the first Add to Cart button
      const addToCartButton = await page.locator('.product-card button:has-text("Add to Cart")').first();
      await addToCartButton.click();
      console.log('Added item to cart');
      
      // Wait for cart animation and toast message
      await page.waitForTimeout(1000);

      // Open cart dialog
      await page.locator('button:has-text("Cart")').click();
      console.log('Opened cart dialog');

      // Click Proceed to Checkout
      await page.locator('button:has-text("Proceed to Checkout")').click();
      console.log('Clicked proceed to checkout');

      // Select delivery method
      await page.locator('button:has-text("Delivery")').click();
      console.log('Selected delivery method');

      // Fill delivery form
      await page.getByLabel('Name').fill('Test User');
      await page.getByLabel('Phone').fill('1234567890');
      await page.getByLabel('Email').fill('test@example.com');
      await page.getByLabel('Address').fill('123 Test St');
      console.log('Filled delivery form');

      // Submit order
      await page.locator('button:has-text("Place Order")').click();
      console.log('Submitted order');

      // Wait for success message
      await page.waitForSelector('text=Order Placed Successfully', { 
        timeout: 10000,
        state: 'visible'
      });
      
      console.log('Order placed successfully!');
      orderPlaced = true;
      
    } catch (error) {
      console.error(`\nAttempt ${attempts} failed:`, error.message);
      
      // Take a screenshot of the failure
      await page.screenshot({ 
        path: `test-results/failure-attempt-${attempts}.png`,
        fullPage: true 
      });

      // If dialog is open, close it before next attempt
      try {
        await page.locator('button[aria-label="Close"]').click();
      } catch (e) {
        // Ignore if dialog is not open
      }
      
      // Wait before next attempt
      await page.waitForTimeout(2000);
    }
  }

  expect(orderPlaced, `Failed to place order after ${maxAttempts} attempts`).toBe(true);
});
