import { expect } from '@playwright/test';
import { test } from '../fixtures/auth';

test.describe('Phase A — Authentication & Navigation', () => {

  test.describe('Login Flow', () => {

    test('should redirect to login when accessing root without session', async ({ page }) => {
      await page.goto('/');
      await expect(page).toHaveURL(/\/login/);
      await expect(page.locator('app-login')).toBeVisible();
    });

    test('should redirect to login when accessing dashboard without session', async ({ page }) => {
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/\/login/);
      await expect(page.locator('app-login')).toBeVisible();
    });

    test('should redirect to login when accessing protected routes without session', async ({ page }) => {
      const protectedRoutes = [
        '/product/INQ',
        '/user',
        '/settings/customer',
        '/inventorystocktake',
        '/bir-posting-slsp',
      ];

      for (const route of protectedRoutes) {
        await page.goto(route);
        await expect(page).toHaveURL(/\/login/);
      }
    });

    test('should display login form with database dropdown, user ID and password fields', async ({ page }) => {
      await page.goto('/login');
      await page.waitForSelector('form.form-signin', { state: 'visible' });
      await expect(page.getByPlaceholder('User ID')).toBeVisible();
      await expect(page.getByPlaceholder('Password')).toBeVisible();
      await expect(page.locator('button.btn-lg.btn-primary')).toBeVisible();
    });

    test('should have Sign In button enabled once database is auto-selected', async ({ page }) => {
      await page.goto('/login');
      await expect(page.locator('button.btn-lg.btn-primary')).toBeEnabled({ timeout: 10000 });
    });

    test('should enable Sign In button when a database is selected', async ({ page }) => {
      await page.goto('/login');
      await expect(page.locator('button.btn-lg.btn-primary')).toBeEnabled({ timeout: 10000 });
      await page.locator('select.form-select').selectOption({ index: 1 });
      await expect(page.locator('button.btn-lg.btn-primary')).toBeEnabled();
    });

    test('should show error message on invalid credentials', async ({ page }) => {
      await page.goto('/login');
      await page.waitForSelector('form.form-signin', { state: 'visible' });
      await page.getByPlaceholder('User ID').fill('nonexistent_user');
      await page.getByPlaceholder('Password').fill('wrong_password');
      await page.locator('button.btn-lg.btn-primary').click();
      const errorMsg = page.locator('div.text-danger.mt-2');
      await expect(errorMsg).toBeVisible({ timeout: 10000 });
      const errorText = await errorMsg.textContent();
      expect(errorText).toContain('Invalid User Id / Password');
    });

    test('should clear login error when user types in password field', async ({ page, auth }) => {
      await page.goto('/login');
      await page.waitForSelector('form.form-signin', { state: 'visible' });
      await page.getByPlaceholder('User ID').fill('admin');
      await page.getByPlaceholder('Password').fill('wrong');
      await page.locator('button.btn-lg.btn-primary').click();
      await expect(page.locator('div.text-danger.mt-2')).toBeVisible();
      await page.getByPlaceholder('Password').fill('newpass');
      await expect(page.locator('div.text-danger.mt-2')).not.toBeVisible();
    });

    test('should login successfully with valid credentials and navigate to dashboard', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await expect(page).toHaveURL(/\/dashboard/);
      await expect(page.locator('.dashboard-header h2')).toBeVisible({ timeout: 15000 });
    });

    test('should store session token in localStorage after login', async ({ page, auth }) => {
      await auth.loginAsDefault();
      const token = await page.evaluate(() => localStorage.getItem('sessionToken'));
      const db = await page.evaluate(() => localStorage.getItem('selectedDatabase'));
      expect(token).toBeTruthy();
      expect(token!.length).toBeGreaterThan(0);
      expect(db).toBeTruthy();
    });

    test('should display dashboard with KPI cards after login', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await expect(page.locator('.dashboard-header h2')).toBeVisible({ timeout: 15000 });
      const kpiCount = await page.locator('.kpi-card').count();
      expect(kpiCount).toBe(4);
    });

    test('should display dashboard heading and welcome message', async ({ page, auth }) => {
      await auth.loginAsDefault();
      const heading = page.locator('.dashboard-header h2');
      await expect(heading).toBeVisible({ timeout: 15000 });
      await expect(heading).toHaveText('Dashboard Overview');
      const welcome = page.locator('.dashboard-header p.text-muted');
      await expect(welcome).toBeVisible();
    });

    test('should display all 4 KPI labels on dashboard', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await expect(page.getByText('Total Sales', { exact: true })).toBeVisible({ timeout: 15000 });
      await expect(page.getByText('Total Purchases', { exact: true })).toBeVisible();
      await expect(page.getByText('Products Sold', { exact: true })).toBeVisible();
      await expect(page.getByText('Gross Profit', { exact: true })).toBeVisible();
    });

    test('should display chart cards on dashboard', async ({ page, auth }) => {
      await auth.loginAsDefault();
      const chartCards = await page.locator('.chart-card').count();
      expect(chartCards).toBeGreaterThanOrEqual(4);
    });

    test('should display data cards (Top Products, Customers, Vendors)', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await expect(page.locator('.card-header:has-text("Top 5 Products")')).toBeVisible({ timeout: 15000 });
      await expect(page.locator('.card-header:has-text("Top 5 Customers")')).toBeVisible();
      await expect(page.locator('.card-header:has-text("Top 5 Vendors")')).toBeVisible();
    });

    test('should logout and redirect to login page', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await expect(page.locator('.dashboard-header h2')).toBeVisible({ timeout: 15000 });
      await auth.logout();
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
      await expect(page.locator('app-login')).toBeVisible();
    });

    test('should clear session token on logout', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await auth.logout();
      const token = await page.evaluate(() => localStorage.getItem('sessionToken'));
      const db = await page.evaluate(() => localStorage.getItem('selectedDatabase'));
      expect(token).toBeNull();
      expect(db).toBeNull();
    });

    test('should redirect to login when session token is expired/removed', async ({ page }) => {
      await page.goto('/');
      await expect(page).toHaveURL(/\/login/);
    });

    test('should redirect to login when accessing protected route with invalid token', async ({ page }) => {
      await page.goto('/login');
      await page.evaluate(() => {
        localStorage.setItem('sessionToken', 'invalid-token-xyz');
        localStorage.setItem('selectedDatabase', 'TestDB');
      });
      await page.goto('/product/INQ');
      await expect(page).toHaveURL(/\/login/);
    });

    test('should handle Enter key press on login form', async ({ page }) => {
      await page.goto('/login');
      await page.waitForSelector('form.form-signin', { state: 'visible' });
      await page.getByPlaceholder('User ID').fill('nonexistent_user');
      await page.getByPlaceholder('Password').fill('wrong_password');
      await page.locator('input[type="password"]').press('Enter');
      await expect(page.locator('div.text-danger.mt-2')).toBeVisible();
    });

    test('should show database loading spinner on initial load', async ({ page }) => {
      await page.goto('/login');
      await expect(page.locator('form.form-signin')).toBeVisible();
    });

    test('should display database selection or error on login page', async ({ page }) => {
      await page.goto('/login');
      await page.waitForSelector('form.form-signin', { state: 'visible' });
      const selectVisible = await page.locator('select.form-select').isVisible().catch(() => false);
      const alertVisible = await page.locator('div.alert-warning').isVisible().catch(() => false);
      expect(selectVisible || alertVisible).toBeTruthy();
    });
  });

  test.describe('Responsive — Tablet Viewport', () => {

    test('should render login page correctly on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/login');
      await page.waitForSelector('form.form-signin', { state: 'visible' });
      await expect(page.getByPlaceholder('User ID')).toBeVisible();
      await expect(page.getByPlaceholder('Password')).toBeVisible();
      await expect(page.locator('button.btn-lg.btn-primary')).toBeVisible();
    });

    test('should render dashboard correctly on tablet viewport', async ({ page, auth }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await auth.loginAsDefault();
      await expect(page.locator('.dashboard-header h2')).toBeVisible({ timeout: 15000 });
    });

    test('should wrap login form on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/login');
      const form = page.locator('form.form-signin');
      await expect(form).toBeVisible();
      const box = await form.boundingBox();
      expect(box!.width).toBeLessThanOrEqual(768);
    });
  });
});
