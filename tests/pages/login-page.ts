import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly databaseSelect: Locator;
  readonly userIdInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;
  readonly loginError: Locator;
  readonly errorMsg: Locator;

  constructor(page: Page) {
    this.page = page;
    this.databaseSelect = page.locator('#databaseSelect');
    this.userIdInput = page.locator('#inputEmail');
    this.passwordInput = page.locator('#inputPassword');
    this.signInButton = page.locator('button.btn-lg.btn-primary');
    this.loginError = page.locator('div.text-danger.mt-2').first();
    this.errorMsg = page.locator('div.alert-warning').first();
  }

  async goto() {
    await this.page.goto('/login');
  }

  async selectDatabase(databaseName: string) {
    await this.databaseSelect.selectOption(databaseName);
  }

  async selectDatabaseByIndex(index: number) {
    await this.databaseSelect.locator('option').nth(index).click();
  }

  async enterUserId(code: string) {
    await this.userIdInput.fill(code);
  }

  async enterPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async clickSignIn() {
    await this.signInButton.click();
  }

  async login({ databaseName, userId, password }: { databaseName: string; userId: string; password: string }) {
    await this.selectDatabase(databaseName);
    await this.enterUserId(userId);
    await this.enterPassword(password);
    await this.clickSignIn();
  }

  async getLoginErrorMessage() {
    return this.loginError.isVisible() ? this.loginError.textContent() : null;
  }

  async getErrorMessage() {
    return this.errorMsg.isVisible() ? this.errorMsg.textContent() : null;
  }

  async getSelectedDatabase() {
    return this.databaseSelect.inputValue();
  }

  async getAvailableDatabases() {
    return this.databaseSelect.locator('option').allTextContents();
  }

  async isSignInButtonDisabled() {
    return this.signInButton.isDisabled();
  }

  async waitForPageLoad() {
    // Wait for Angular to stabilize
    await this.page.waitForLoadState('networkidle');
  }

  async waitForAngular() {
    await this.page.waitForFunction(() => !document.querySelector('[ng-binding]') || true);
  }
}
