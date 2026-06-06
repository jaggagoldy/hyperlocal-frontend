import { test, expect } from '@playwright/test';

test.describe('Vendor OS Core Super App Loop', () => {
  // Use a unique business name per run to avoid conflicts
  const uniqueBusinessName = `Test Transport ${Date.now()}`;

  test('should complete the polymorphic CAB_TRANSPORT wizard and mount correct frontend layout', async ({ page }) => {
    
    // ==========================================
    // STEP 1: AUTHENTICATE & LOGIN AS VENDOR
    // ==========================================
    await page.goto('/vendor/login');
    
    // Simulate OTP Login (This depends on exact UI locators, using generic assumptions for now)
    // Assume there is a phone input and send OTP button
    await page.fill('input[type="tel"]', '9999966666'); // Test vendor account
    await page.click('button:has-text("Send OTP")');
    
    // Wait for OTP input and submit
    await page.fill('input[placeholder*="OTP"]', '123456'); // Assuming mock OTP or bypass
    await page.click('button:has-text("Verify")');

    // Wait for redirect to Vendor Hub
    await page.waitForURL('/vendor-dashboard/workspace');
    await expect(page.locator('h1')).toContainText('Welcome back');

    // ==========================================
    // STEP 2: NAVIGATE TO BUSINESS WIZARD
    // ==========================================
    await page.click('a:has-text("Add New Business")');
    await page.waitForURL('/vendor-dashboard/workspace/management/my-business');
    await expect(page.locator('h2')).toContainText('Select Business Category');

    // ==========================================
    // STEP 3: FILL WIZARD (CAB_TRANSPORT)
    // ==========================================
    // Step 1 of Wizard
    await page.click('button:has-text("Cab & Transport")');
    await page.fill('input[placeholder*="Business Name"]', uniqueBusinessName);
    await page.fill('input[placeholder*="City"]', 'New Delhi');
    await page.fill('textarea', 'Automated Playwright Test Transport Service');
    await page.click('button:has-text("Continue")');

    // Step 2 of Wizard (Polymorphic inputs for Cab)
    await expect(page.locator('h2')).toContainText('Storefront Customization');
    await page.fill('input[placeholder*="Vehicle Model"]', 'Toyota Innova Crysta');
    await page.selectOption('select', 'SUV');
    await page.fill('input[type="number"]', '6'); // Seats
    // AC is a checkbox, click its label
    await page.check('input[type="checkbox"]');

    // Submit
    await page.click('button:has-text("Create Business")');

    // ==========================================
    // STEP 4: WAIT FOR REDIRECT & VERIFY CREATION
    // ==========================================
    await page.waitForURL('/vendor-dashboard/workspace');
    await expect(page.locator('text=Storefront Activated').first()).toBeVisible({ timeout: 10000 });
    
    // Extract the slug (this usually requires fetching it from the UI or API, 
    // but Next.js router handles it. Let's assume the slug is generated as name-city)
    const expectedSlug = `${uniqueBusinessName.toLowerCase().replace(/ /g, '-')}-new-delhi`;

    // ==========================================
    // STEP 5 & 6: CONSUMER VIEW POLYMORPHIC MOUNT
    // ==========================================
    // Navigate to the consumer view
    await page.goto(`/vendor/${expectedSlug}`);
    
    // Assert CabTransportLayout mounted correctly
    // Look for Cab specific UI elements (e.g., Vehicle Model, Type, Seats)
    await expect(page.locator('body')).toContainText('Toyota Innova Crysta');
    await expect(page.locator('body')).toContainText('SUV');
    await expect(page.locator('body')).toContainText('6 Seats');
    await expect(page.locator('body')).toContainText('AC');

    // Check for WhatsApp negotiation button
    const whatsappBtn = page.locator('a:has-text("Call & Negotiate")');
    await expect(whatsappBtn).toBeVisible();
    
    // Assert CartDrawer is ABSENT (Since transport doesn't use cart)
    const cartDrawer = page.locator('text=View Cart');
    await expect(cartDrawer).toHaveCount(0);
  });
});
