import { test, expect } from '@playwright/test';

test.describe('Order Flow', () => {
  test('should complete order from cart to backend', async ({ page }, testInfo) => {
    testInfo.setTimeout(60000); // Increase timeout to 60 seconds
    console.log('Starting test...');
    // Navigate to frontend
    console.log('Navigating to frontend...');
    await page.goto('http://localhost:8080');
    
    // Verify page loaded
    console.log('Checking page content...');
    const pageContent = await page.content();
    console.log('Page content:', pageContent);
    
    // Add products to cart
    console.log('Waiting for product cards...');
    let productCards;
    try {
      await page.waitForSelector('.product-card', { timeout: 30000 });
      console.log('Taking screenshot of page...');
      await page.screenshot({ path: 'test-screenshot.png' });
      productCards = await page.$$('.product-card');
      console.log(`Found ${productCards.length} product cards`);
    } catch (error) {
      console.error('Error finding product cards:', error);
      throw error;
    }
    if (!productCards || productCards.length === 0) {
      throw new Error('No product cards found');
    }
    await productCards[0].click();
    console.log('Waiting for Add to Cart button...');
    await page.waitForSelector('button:has-text("Add to Cart")', { timeout: 10000 });
    await page.click('button:has-text("Add to Cart")');

    // Go to checkout
    await page.click('button:has-text("Checkout")');

    // Fill shipping form
    await page.fill('#name', 'Test User');
    await page.fill('#address', '123 Test St');
    await page.fill('#city', 'Test City');
    await page.fill('#zip', '12345');
    await page.click('button:has-text("Place Order")');

    // Verify order creation
    const orderResponse = await page.waitForResponse(
      response => response.url().includes('/api/orders') && response.status() === 201
    );
    const orderData = await orderResponse.json();
    expect(orderData).toHaveProperty('id');

    // Validate data in Airtable
    const airtableResponse = await page.waitForResponse(
      response => response.url().includes('airtable.com') && response.status() === 200
    );
    const airtableData = await airtableResponse.json();
    expect(airtableData.records[0].fields).toMatchObject({
      Name: 'Test User',
      Address: '123 Test St',
      City: 'Test City',
      Zip: '12345'
    });

    // Run in loop until order is placed
    let orderPlaced = false;
    while (!orderPlaced) {
      const statusResponse = await page.waitForResponse(
        response => response.url().includes('/api/orders/status') && response.status() === 200
      );
      const statusData = await statusResponse.json();
      if (statusData.status === 'completed') {
        orderPlaced = true;
      }
      await page.waitForTimeout(1000);
    }
  });
});
