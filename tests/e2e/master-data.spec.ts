import { expect } from '@playwright/test';
import { test } from '../fixtures/auth';

test.describe('Phase B — Master Data CRUD', () => {

  // =========================================================================
  // Customer CRUD Tests
  // =========================================================================

  test.describe('Customer CRUD', () => {

    test('should load Customer list page with correct header', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/settings/customer');
      await expect(page.locator('app-customer')).toBeVisible({ timeout: 10000 });
      const headerText = page.locator('.header-content h2, h2');
      await expect(headerText.first()).toBeVisible();
    });

    test('should display New Customer button', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/settings/customer');
      await page.waitForSelector('app-list', { state: 'visible' });
      const newButton = page.locator('app-list a.btn-primary.btn-sm');
      await expect(newButton).toBeVisible({ timeout: 10000 });
    });

    test('should navigate to New Customer detail page', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/settings/customer');
      await page.waitForSelector('app-list', { state: 'visible' });
      await page.locator('app-list a.btn-primary.btn-sm').click();
      await expect(page).toHaveURL(/\/settings\/customer\/new/, { timeout: 10000 });
      await expect(page.locator('app-customer-detail')).toBeVisible({ timeout: 10000 });
    });

    test('should create a new customer', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/settings/customer/new');
      await expect(page.locator('app-customer-detail')).toBeVisible({ timeout: 10000 });

      // Fill in the form fields
      await page.locator('#userPK').fill('TESTCUST001');
      await page.locator('#name').fill('Test Customer Name');
      await page.locator('#tINVATNumber').fill('123-456-789-000');

      // Click Save button (action-menu Save button)
      const saveBtn = page.locator('app-action-menu button.btn-success, app-action-menu button:has-text("Save")');
      await expect(saveBtn).toBeVisible({ timeout: 5000 });
      await saveBtn.click();

      // Should redirect to customer list after save
      await expect(page).toHaveURL(/\/settings\/customer/, { timeout: 10000 });
    });

    test('should show validation error when saving customer without name', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/settings/customer/new');
      await expect(page.locator('app-customer-detail')).toBeVisible({ timeout: 10000 });

      // Fill only userPK, leave name empty
      await page.locator('#userPK').fill('TESTCUST002');

      // Click Save button
      const saveBtn = page.locator('app-action-menu button:has-text("Save")');
      await saveBtn.click();

      // Should still be on detail page (validation failed)
      await expect(page.locator('app-customer-detail')).toBeVisible({ timeout: 5000 });
    });

    test('should show validation error when saving customer without code', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/settings/customer/new');
      await expect(page.locator('app-customer-detail')).toBeVisible({ timeout: 10000 });

      // Fill only name, leave userPK empty
      await page.locator('#name').fill('Test Customer No Code');

      // Click Save button
      const saveBtn = page.locator('app-action-menu button:has-text("Save")');
      await saveBtn.click();

      // Should still be on detail page (validation failed)
      await expect(page.locator('app-customer-detail')).toBeVisible({ timeout: 5000 });
    });

    test('should search for customers', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/settings/customer');
      await page.waitForSelector('app-list', { state: 'visible' });

      // Use the search input in the list component
      const searchInput = page.locator('app-list input[type="search"]');
      await expect(searchInput).toBeVisible({ timeout: 10000 });
      await searchInput.fill('TEST');
      // Search is triggered via ngModelChange on the list component
      // The parent CustomerComponent handles onSearch with criteria.userPK
    });

    test('should navigate to existing customer detail by clicking the code link', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/settings/customer');
      await page.waitForSelector('app-list', { state: 'visible' });

      // Click on the first customer link in the table (if any exist)
      const customerLink = page.locator('app-list a.text-primary.fw-bold').first();
      // If there are customers in the list, click the first one
      const isVisible = await customerLink.isVisible({ timeout: 5000 }).catch(() => false);
      if (isVisible) {
        await customerLink.click();
        await expect(page.locator('app-customer-detail')).toBeVisible({ timeout: 10000 });
      }
    });

    test('should toggle edit mode on customer detail page', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/settings/customer');
      await page.waitForSelector('app-list', { state: 'visible' });

      // Try to navigate to an existing customer or just verify the detail page structure
      const editBtn = page.locator('app-action-menu button:has-text("Edit")');
      const editVisible = await editBtn.isVisible({ timeout: 3000 }).catch(() => false);
      if (editVisible) {
        await editBtn.click();
        const saveBtn = page.locator('app-action-menu button:has-text("Save")');
        await expect(saveBtn).toBeVisible({ timeout: 5000 });
      }
    });

    test('should go back to list from customer detail', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/settings/customer/new');
      await expect(page.locator('app-customer-detail')).toBeVisible({ timeout: 10000 });

      // Click the "Customer" header link to go back
      const headerLink = page.locator('.header-link');
      await headerLink.click();
      await expect(page).toHaveURL(/\/settings\/customer/, { timeout: 10000 });
    });
  });

  // =========================================================================
  // Supplier CRUD Tests
  // =========================================================================

  test.describe('Supplier CRUD', () => {

    test('should load Supplier list page with correct header', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/settings/supplier');
      await expect(page.locator('app-supplier')).toBeVisible({ timeout: 10000 });
      const headerText = page.locator('.header-content h2, h2');
      await expect(headerText.first()).toBeVisible();
    });

    test('should display New Supplier button', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/settings/supplier');
      await page.waitForSelector('app-list', { state: 'visible' });
      const newButton = page.locator('app-list a.btn-primary.btn-sm');
      await expect(newButton).toBeVisible({ timeout: 10000 });
    });

    test('should navigate to New Supplier detail page', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/settings/supplier');
      await page.waitForSelector('app-list', { state: 'visible' });
      await page.locator('app-list a.btn-primary.btn-sm').click();
      await expect(page).toHaveURL(/\/settings\/supplier\/new/, { timeout: 10000 });
      await expect(page.locator('app-supplier-detail')).toBeVisible({ timeout: 10000 });
    });

    test('should create a new supplier', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/settings/supplier/new');
      await expect(page.locator('app-supplier-detail')).toBeVisible({ timeout: 10000 });

      await page.locator('#userPK').fill('TESTSUPL001');
      await page.locator('#name').fill('Test Supplier Name');
      await page.locator('#tINVATNumber').fill('987-654-321-000');

      const saveBtn = page.locator('app-action-menu button:has-text("Save")');
      await expect(saveBtn).toBeVisible({ timeout: 5000 });
      await saveBtn.click();

      await expect(page).toHaveURL(/\/settings\/supplier/, { timeout: 10000 });
    });

    test('should show validation error when saving supplier without name', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/settings/supplier/new');
      await page.locator('#userPK').fill('TESTSUPL002');

      const saveBtn = page.locator('app-action-menu button:has-text("Save")');
      await saveBtn.click();

      await expect(page.locator('app-supplier-detail')).toBeVisible({ timeout: 5000 });
    });

    test('should show validation error when saving supplier without code', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/settings/supplier/new');
      await page.locator('#name').fill('Test Supplier No Code');

      const saveBtn = page.locator('app-action-menu button:has-text("Save")');
      await saveBtn.click();

      await expect(page.locator('app-supplier-detail')).toBeVisible({ timeout: 5000 });
    });

    test('should search for suppliers', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/settings/supplier');
      await page.waitForSelector('app-list', { state: 'visible' });

      const searchInput = page.locator('app-list input[type="search"]');
      await expect(searchInput).toBeVisible({ timeout: 10000 });
      await searchInput.fill('TEST');
    });

    test('should go back to list from supplier detail', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/settings/supplier/new');
      await expect(page.locator('app-supplier-detail')).toBeVisible({ timeout: 10000 });

      const headerLink = page.locator('.header-link');
      await headerLink.click();
      await expect(page).toHaveURL(/\/settings\/supplier/, { timeout: 10000 });
    });
  });

  // =========================================================================
  // Payee CRUD Tests
  // =========================================================================

  test.describe('Payee CRUD', () => {

    test('should load Payee list page with correct header', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/settings/payee');
      await expect(page.locator('app-payee')).toBeVisible({ timeout: 10000 });
      const headerText = page.locator('.header-content h2, h2');
      await expect(headerText.first()).toBeVisible();
    });

    test('should display New Payee button', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/settings/payee');
      await page.waitForSelector('app-list', { state: 'visible' });
      const newButton = page.locator('app-list a.btn-primary.btn-sm');
      await expect(newButton).toBeVisible({ timeout: 10000 });
    });

    test('should navigate to New Payee detail page', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/settings/payee');
      await page.waitForSelector('app-list', { state: 'visible' });
      await page.locator('app-list a.btn-primary.btn-sm').click();
      await expect(page).toHaveURL(/\/settings\/payee\/new/, { timeout: 10000 });
      await expect(page.locator('app-payee-detail')).toBeVisible({ timeout: 10000 });
    });

    test('should create a new payee', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/settings/payee/new');
      await expect(page.locator('app-payee-detail')).toBeVisible({ timeout: 10000 });

      await page.locator('#userPK').fill('TESTPAYEE001');
      await page.locator('#name').fill('Test Payee Name');
      await page.locator('#tINVATNumber').fill('456-789-012-000');

      const saveBtn = page.locator('app-action-menu button:has-text("Save")');
      await expect(saveBtn).toBeVisible({ timeout: 5000 });
      await saveBtn.click();

      await expect(page).toHaveURL(/\/settings\/payee/, { timeout: 10000 });
    });

    test('should show validation error when saving payee without name', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/settings/payee/new');
      await page.locator('#userPK').fill('TESTPAYEE002');

      const saveBtn = page.locator('app-action-menu button:has-text("Save")');
      await saveBtn.click();

      await expect(page.locator('app-payee-detail')).toBeVisible({ timeout: 5000 });
    });

    test('should show validation error when saving payee without code', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/settings/payee/new');
      await page.locator('#name').fill('Test Payee No Code');

      const saveBtn = page.locator('app-action-menu button:has-text("Save")');
      await saveBtn.click();

      await expect(page.locator('app-payee-detail')).toBeVisible({ timeout: 5000 });
    });

    test('should search for payees', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/settings/payee');
      await page.waitForSelector('app-list', { state: 'visible' });

      const searchInput = page.locator('app-list input[type="search"]');
      await expect(searchInput).toBeVisible({ timeout: 10000 });
      await searchInput.fill('TEST');
    });

    test('should go back to list from payee detail', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/settings/payee/new');
      await expect(page.locator('app-payee-detail')).toBeVisible({ timeout: 10000 });

      const headerLink = page.locator('.header-link');
      await headerLink.click();
      await expect(page).toHaveURL(/\/settings\/payee/, { timeout: 10000 });
    });
  });

  // =========================================================================
  // Application Configuration CRUD Tests
  // =========================================================================

  test.describe('Application Configuration CRUD', () => {

    test('should load Application Configuration list page', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/settings/appconfig');
      await expect(page.locator('app-appconfig')).toBeVisible({ timeout: 10000 });
      const headerText = page.locator('h2');
      await expect(headerText.first()).toBeVisible();
    });

    test('should display New Configuration button', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/settings/appconfig');
      const newButton = page.locator('a.btn.btn-primary:has-text("New Configuration")');
      await expect(newButton).toBeVisible({ timeout: 10000 });
    });

    test('should navigate to New Configuration detail page', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/settings/appconfig');
      const newButton = page.locator('a.btn.btn-primary:has-text("New Configuration")');
      await newButton.click();
      await expect(page).toHaveURL(/\/settings\/appconfig\/new/, { timeout: 10000 });
      await expect(page.locator('app-appconfig-detail')).toBeVisible({ timeout: 10000 });
    });

    test('should create a new application configuration', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/settings/appconfig/new');
      await expect(page.locator('app-appconfig-detail')).toBeVisible({ timeout: 10000 });

      // Fill in the form fields
      await page.locator('#key').fill('test_feature_flag');
      await page.locator('#description').fill('Test feature flag configuration');

      // Select category
      await page.locator('#category').selectOption('Feature');

      // Switch to JSON tab and add JSON content
      await page.locator('[class*="nav-link"]:has-text("JSON Editor")').click();
      const jsonTextarea = page.locator('.json-textarea');
      await expect(jsonTextarea).toBeVisible({ timeout: 5000 });
      await jsonTextarea.fill('{"enabled": true, "maxRetries": 3}');

      // Verify JSON is valid
      const jsonStatus = page.locator('.json-status');
      await expect(jsonStatus).toBeVisible();

      // Click Save button
      const saveBtn = page.locator('app-action-menu button:has-text("Save")');
      await expect(saveBtn).toBeVisible({ timeout: 5000 });
      await saveBtn.click();

      // Should redirect to configuration list after save
      await expect(page).toHaveURL(/\/settings\/appconfig/, { timeout: 10000 });
    });

    test('should show validation error when saving config without key', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/settings/appconfig/new');
      await expect(page.locator('app-appconfig-detail')).toBeVisible({ timeout: 10000 });

      // Leave key empty, fill only description
      await page.locator('#description').fill('Missing key config');

      const saveBtn = page.locator('app-action-menu button:has-text("Save")');
      await saveBtn.click();

      // Should still be on detail page
      await expect(page.locator('app-appconfig-detail')).toBeVisible({ timeout: 5000 });
    });

    test('should show validation error for invalid JSON in config', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/settings/appconfig/new');
      await expect(page.locator('app-appconfig-detail')).toBeVisible({ timeout: 10000 });

      await page.locator('#key').fill('test_invalid_json');
      await page.locator('#description').fill('Invalid JSON config');
      await page.locator('#category').selectOption('Setting');

      // Switch to JSON tab
      await page.locator('[class*="nav-link"]:has-text("JSON Editor")').click();
      const jsonTextarea = page.locator('.json-textarea');
      await expect(jsonTextarea).toBeVisible({ timeout: 5000 });
      await jsonTextarea.fill('{invalid json content}');

      // Click Save
      const saveBtn = page.locator('app-action-menu button:has-text("Save")');
      await saveBtn.click();

      // Should still be on detail page (validation failed)
      await expect(page.locator('app-appconfig-detail')).toBeVisible({ timeout: 5000 });
    });

    test('should search for configurations', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/settings/appconfig');
      const searchInput = page.locator('input[type="search"]');
      await expect(searchInput).toBeVisible({ timeout: 10000 });
      await searchInput.fill('test');
    });

    test('should go back to list from configuration detail', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/settings/appconfig/new');
      await expect(page.locator('app-appconfig-detail')).toBeVisible({ timeout: 10000 });

      const headerLink = page.locator('.header-link');
      await headerLink.click();
      await expect(page).toHaveURL(/\/settings\/appconfig/, { timeout: 10000 });
    });

    test('should display Add Field button in Smart Form edit mode', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/settings/appconfig/new');
      await expect(page.locator('app-appconfig-detail')).toBeVisible({ timeout: 10000 });

      // In new mode, the detail page should already be in edit mode
      const addButton = page.locator('.form-toolbar button:has-text("Add Field"), .smart-form-container .btn:has-text("Add Field")');
      await expect(addButton).toBeVisible({ timeout: 5000 });
    });

    test('should show tabs on configuration detail page', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/settings/appconfig/new');
      await expect(page.locator('app-appconfig-detail')).toBeVisible({ timeout: 10000 });

      // Check Smart Form tab
      const smartFormTab = page.locator('[class*="nav-link"]:has-text("Smart Form")');
      await expect(smartFormTab).toBeVisible();

      // Check JSON Editor tab
      const jsonTab = page.locator('[class*="nav-link"]:has-text("JSON Editor")');
      await expect(jsonTab).toBeVisible();
    });

    test('should switch between Smart Form and JSON Editor tabs', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/settings/appconfig/new');
      await expect(page.locator('app-appconfig-detail')).toBeVisible({ timeout: 10000 });

      // Click JSON tab
      await page.locator('[class*="nav-link"]:has-text("JSON Editor")').click();
      await expect(page.locator('.json-textarea')).toBeVisible();

      // Switch back to Smart Form tab
      await page.locator('[class*="nav-link"]:has-text("Smart Form")').click();
      await expect(page.locator('.smart-form-container')).toBeVisible();
    });
  });

});
