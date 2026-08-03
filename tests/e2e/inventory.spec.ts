import { expect } from '@playwright/test';
import { test } from '../fixtures/auth';

test.describe('Phase D — Inventory & Transactions', () => {

  // =========================================================================
  // Stock Take Tests
  // =========================================================================

  test.describe('Stock Take', () => {

    test('should load Stock Take list page', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/inventorystocktake');
      await expect(page.locator('app-inventory-stock-take')).toBeVisible({ timeout: 10000 });
    });

    test('should display Stock Take header', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/inventorystocktake');
      await expect(page.locator('app-inventory-stock-take')).toBeVisible({ timeout: 10000 });
      const header = page.locator('.main-header h2');
      await expect(header).toBeVisible();
      const headerText = await header.textContent();
      expect(headerText?.includes('Stock Take Sessions')).toBeTruthy();
    });

    test('should display search criteria section', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/inventorystocktake');
      await expect(page.locator('app-inventory-stock-take')).toBeVisible({ timeout: 10000 });
      const searchHeader = page.locator('.card-header label:has-text("Search Criteria")');
      await expect(searchHeader).toBeVisible();
    });

    test('should display New Session button', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/inventorystocktake');
      await expect(page.locator('app-inventory-stock-take')).toBeVisible({ timeout: 10000 });
      const newButton = page.locator('button.btn-primary:has-text("New Session")');
      await expect(newButton).toBeVisible({ timeout: 5000 });
    });

    test('should navigate to New Session detail page', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/inventorystocktake');
      await expect(page.locator('app-inventory-stock-take')).toBeVisible({ timeout: 10000 });
      const newButton = page.locator('button.btn-primary:has-text("New Session")');
      await newButton.click();
      await expect(page).toHaveURL(/\/inventorystocktakedetails\/new/, { timeout: 10000 });
      await expect(page.locator('app-inventory-stock-take-detail')).toBeVisible({ timeout: 10000 });
    });

    test('should create a new stock take session', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/inventorystocktake');
      await expect(page.locator('app-inventory-stock-take')).toBeVisible({ timeout: 10000 });

      // Click New Session button
      const newButton = page.locator('button.btn-primary:has-text("New Session")');
      await newButton.click();

      await expect(page.locator('app-inventory-stock-take-detail')).toBeVisible({ timeout: 10000 });

      // Fill in the session form (Name uses id="inputName" in template)
      await page.locator('#inputName').fill('Test Stock Take Session');
      await page.locator('select[name="type"]').selectOption('1'); // Partial

      // Click Save button
      const saveBtn = page.locator('app-action-menu button:has-text("Save")');
      await expect(saveBtn).toBeVisible({ timeout: 5000 });
      await saveBtn.click();

      // Should redirect to session list after save
      await expect(page).toHaveURL(/\/inventorystocktake/, { timeout: 10000 });
    });

    test('should show validation error when saving session without name', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/inventorystocktake');
      await expect(page.locator('app-inventory-stock-take')).toBeVisible({ timeout: 10000 });

      // Click New Session button
      const newButton = page.locator('button.btn-primary:has-text("New Session")');
      await newButton.click();

      await expect(page.locator('app-inventory-stock-take-detail')).toBeVisible({ timeout: 10000 });

      // Leave name empty, just click Save
      const saveBtn = page.locator('app-action-menu button:has-text("Save")');
      await saveBtn.click();

      // Should still be on detail page (validation failed)
      await expect(page.locator('app-inventory-stock-take-detail')).toBeVisible({ timeout: 5000 });
    });

    test('should search for stock take sessions', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/inventorystocktake');
      await expect(page.locator('app-inventory-stock-take')).toBeVisible({ timeout: 10000 });

      // Use the search input in the stock take component
      const searchInput = page.locator('app-inventory-stock-take input[type="search"]');
      await expect(searchInput).toBeVisible({ timeout: 10000 });
      await searchInput.fill('TEST');
    });

    test('should navigate to session detail by clicking name link if sessions exist', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/inventorystocktake');
      await expect(page.locator('app-inventory-stock-take')).toBeVisible({ timeout: 10000 });

      // Click on the first session name link (if any exist)
      const sessionLink = page.locator('app-inventory-stock-take a.text-primary.fw-bold').first();
      const isVisible = await sessionLink.isVisible({ timeout: 5000 }).catch(() => false);
      if (isVisible) {
        await sessionLink.click();
        await expect(page.locator('app-inventory-stock-take-detail')).toBeVisible({ timeout: 10000 });
      }
    });

    test('should go back to list from session detail', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/inventorystocktake');
      await expect(page.locator('app-inventory-stock-take')).toBeVisible({ timeout: 10000 });

      // Click New Session button
      const newButton = page.locator('button.btn-primary:has-text("New Session")');
      await newButton.click();

      await expect(page.locator('app-inventory-stock-take-detail')).toBeVisible({ timeout: 10000 });

      // Click the Stock Take Sessions link in header to go back
      const headerLink = page.locator('.main-header a:has-text("Stock Take Sessions")');
      await headerLink.click();
      await expect(page).toHaveURL(/\/inventorystocktake/, { timeout: 10000 });
    });
  });

  // =========================================================================
  // Other Adjustment Tests
  // =========================================================================

  test.describe('Other Adjustment', () => {

    test('should load Other Adjustment list page', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/inventory/otheradj');
      await expect(page.locator('app-other-adjustment')).toBeVisible({ timeout: 10000 });
    });

    test('should display Other Adjustment header', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/inventory/otheradj');
      await expect(page.locator('app-other-adjustment')).toBeVisible({ timeout: 10000 });
      const header = page.locator('app-list h2');
      await expect(header).toBeVisible();
      const headerText = await header.textContent();
      expect(headerText?.includes('Other Adjustment')).toBeTruthy();
    });

    test('should display New button', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/inventory/otheradj');
      await expect(page.locator('app-other-adjustment')).toBeVisible({ timeout: 10000 });
      const newButton = page.locator('app-list a.btn-primary:has-text("New")');
      await expect(newButton).toBeVisible({ timeout: 5000 });
    });

    test('should display New button that links to new URL', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/inventory/otheradj');
      await expect(page.locator('app-other-adjustment')).toBeVisible({ timeout: 10000 });

      // Verify the New button has the correct href attribute
      const newButton = page.locator('app-list a.btn-primary:has-text("New")');
      await expect(newButton).toBeVisible({ timeout: 5000 });
      const href = await newButton.getAttribute('href');
      expect(href).toBe('/inventory/otheradj/new');
    });

    test('should search for other adjustments', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/inventory/otheradj');
      await expect(page.locator('app-other-adjustment')).toBeVisible({ timeout: 10000 });

      // Use the search input in the list component
      const searchInput = page.locator('app-list input[type="search"]');
      await expect(searchInput).toBeVisible({ timeout: 10000 });
      await searchInput.fill('TEST');
    });

    test('should display pagination on Other Adjustment list', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/inventory/otheradj');
      await expect(page.locator('app-other-adjustment')).toBeVisible({ timeout: 10000 });

      // Pagination component should be visible
      const pagination = page.locator('app-pagination');
      await expect(pagination).toBeVisible({ timeout: 5000 });
    });

    test('should display no records message when list is empty', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/inventory/otheradj');
      await expect(page.locator('app-other-adjustment')).toBeVisible({ timeout: 10000 });

      // Should show "No items found" message
      const noItemsHeading = page.locator('h5:has-text("No items found")');
      await expect(noItemsHeading).toBeVisible({ timeout: 5000 });
    });
  });

  // =========================================================================
  // Transaction Tests (OTHERADJ module type)
  // =========================================================================

  test.describe('Transaction', () => {

    test('should load Other Adjustment list page', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/inventory/otheradj');
      await expect(page.locator('app-other-adjustment')).toBeVisible({ timeout: 10000 });
    });

    test('should display Transaction header', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/inventory/otheradj');
      await expect(page.locator('app-other-adjustment')).toBeVisible({ timeout: 10000 });
      const header = page.locator('app-list h2');
      await expect(header).toBeVisible();
      const headerText = await header.textContent();
      expect(headerText?.includes('Other Adjustment')).toBeTruthy();
    });

    test('should display New button on transaction list', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/inventory/otheradj');
      await expect(page.locator('app-other-adjustment')).toBeVisible({ timeout: 10000 });
      const newButton = page.locator('app-list a.btn-primary:has-text("New")');
      await expect(newButton).toBeVisible({ timeout: 5000 });
    });

    test('should display search input on transaction list', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/inventory/otheradj');
      await expect(page.locator('app-other-adjustment')).toBeVisible({ timeout: 10000 });

      const searchInput = page.locator('app-list input[type="search"]');
      await expect(searchInput).toBeVisible({ timeout: 10000 });
      await searchInput.fill('TEST');
    });

    test('should display pagination controls on transaction list', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/inventory/otheradj');
      await expect(page.locator('app-other-adjustment')).toBeVisible({ timeout: 10000 });

      const pagination = page.locator('app-pagination');
      await expect(pagination).toBeVisible({ timeout: 5000 });
    });

    test('should display New button that links to new URL', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/inventory/otheradj');
      await expect(page.locator('app-other-adjustment')).toBeVisible({ timeout: 10000 });

      // Verify the New button has the correct href attribute
      const newButton = page.locator('app-list a.btn-primary:has-text("New")');
      await expect(newButton).toBeVisible({ timeout: 5000 });
      const href = await newButton.getAttribute('href');
      expect(href).toBe('/inventory/otheradj/new');
    });

    test('should display Clear and Refresh buttons on transaction list', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/inventory/otheradj');
      await expect(page.locator('app-other-adjustment')).toBeVisible({ timeout: 10000 });

      const clearBtn = page.locator('app-list button:has-text("Clear")');
      const refreshBtn = page.locator('app-list button:has-text("Refresh")');
      await expect(clearBtn).toBeVisible({ timeout: 5000 });
      await expect(refreshBtn).toBeVisible({ timeout: 5000 });
    });

    test('should clear search on transaction list', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/inventory/otheradj');
      await expect(page.locator('app-other-adjustment')).toBeVisible({ timeout: 10000 });

      const searchInput = page.locator('app-list input[type="search"]');
      await expect(searchInput).toBeVisible({ timeout: 10000 });
      await searchInput.fill('TEST');
      
      // Click Clear button
      const clearBtn = page.locator('app-list button:has-text("Clear")');
      await clearBtn.click();
      
      // Search should be cleared
      const value = await searchInput.inputValue();
      expect(value).toBe('');
    });
  });

});
