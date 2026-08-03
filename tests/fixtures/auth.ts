import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/login-page';
import { DashboardPage } from '../pages/dashboard-page';
import { seedTestData, getAvailableDatabases, clearTestSessions } from '../api/seed-api';

export interface AuthFixture {
  loginAsDefault: () => Promise<void>;
  loginAs: (userId: string, password: string, databaseName?: string) => Promise<void>;
  logout: () => Promise<void>;
  setSessionToken: (token: string, database: string) => Promise<void>;
  clearSession: () => Promise<void>;
  sessionToken: string | null;
}

const API_URL = 'https://localhost:8443';

export const e2eTest = base.extend<AuthFixture>({
  sessionToken: [null, { scope: 'test' }],

  auth: async ({ page, baseURL }, use) => {
    let token: string | null = null;

    async function loginAsDefault() {
      const databases = await getAvailableDatabases(API_URL);
      if (!databases || databases.length === 0) {
        throw new Error('No databases available for E2E login');
      }
      token = await performLogin(page, API_URL, databases[0].DatabaseName);
    }

    async function loginAs(userId: string, password: string, databaseName?: string) {
      let db = databaseName;
      if (!db) {
        const databases = await getAvailableDatabases(API_URL);
        if (!databases || databases.length === 0) {
          throw new Error('No databases available for E2E login');
        }
        db = databases[0].DatabaseName;
      }
      token = await performLogin(page, API_URL, db, userId, password);
    }

    async function logout() {
      // Try sidebar logout first
      const logoutBtn = page.locator('.logout-section .nav-link, [routerlink="/logout"]');
      if (await logoutBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await logoutBtn.click();
        await page.waitForURL(/\/login/, { timeout: 10000 });
      } else {
        // Fallback: navigate directly to logout
        await page.goto('/logout');
        await page.waitForURL(/\/login/, { timeout: 10000 }).catch(() => {});
      }
      // Clear session by navigating to a stable URL first
      await page.goto('/login');
      await clearSessionStorage(page);
      token = null;
    }

    async function setSessionSessionToken(t: string, database: string) {
      token = t;
      await page.goto('/login');
      await setLocalStorage(page, 'sessionToken', t);
      await setLocalStorage(page, 'selectedDatabase', database);
    }

    async function clearSession() {
      await page.goto('/login');
      await clearSessionStorage(page);
      token = null;
    }

    await use({
      loginAsDefault,
      loginAs,
      logout,
      setSessionToken: setSessionSessionToken,
      clearSession,
      get sessionToken() { return token; },
    });

    // Cleanup after each test
    await clearTestSessions(API_URL).catch(() => {});
  },
});

async function performLogin(
  page: import('@playwright/test').Page,
  apiUrl: string,
  databaseName: string,
  userId: string = 'ADMIN',
  password: string = 'admin123'
): Promise<string> {
  // Navigate to a stable URL first to ensure we're on the correct origin
  await page.goto('/login');
  await page.waitForLoadState('networkidle');

  // Login via the API directly to get the token
  const loginResponse = await page.request.post(`${apiUrl}/api/Settings/VerifyLogin`, {
    data: {
      code: userId,
      password: password,
      databaseName: databaseName,
    },
  });

  let body: any;
  if (!loginResponse.ok()) {
    // Try fallback credentials
    const fallbackResponse = await page.request.post(`${apiUrl}/api/Settings/VerifyLogin`, {
      data: {
        code: 'ADMIN',
        password: 'admin123',
        databaseName: databaseName,
      },
    });

    if (!fallbackResponse.ok()) {
      body = await fallbackResponse.json().catch(() => ({}));
      throw new Error(`Login failed for user '${userId}' on database '${databaseName}': ${JSON.stringify(body)}`);
    }
    body = await fallbackResponse.json().catch(() => ({}));
  } else {
    body = await loginResponse.json().catch(() => ({}));
  }

  if (!body.success || !body.data) {
    throw new Error(`Login failed: ${JSON.stringify(body)}`);
  }

  const tk = body.data;

  // Set localStorage on the correct page origin
  await page.goto('/login');
  await setLocalStorage(page, 'sessionToken', tk);
  await setLocalStorage(page, 'selectedDatabase', databaseName);

  // Navigate to dashboard (AuthGuard will pass since token is set)
  await page.goto('/dashboard');
  await page.waitForLoadState('networkidle');

  return tk;
}

async function setLocalStorage(page: import('@playwright/test').Page, key: string, value: string) {
  await page.evaluate(({ k, v }) => {
    localStorage.setItem(k, v);
  }, { k: key, v: value });
}

async function clearSessionStorage(page: import('@playwright/test').Page) {
  await page.evaluate(() => {
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('selectedDatabase');
  });
}

export { e2eTest as test };
