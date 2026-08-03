import { Page, Locator } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly kpiCards: Locator;
  readonly totalSalesLabel: Locator;
  readonly totalSalesValue: Locator;
  readonly totalPurchasesLabel: Locator;
  readonly productsSoldLabel: Locator;
  readonly grossProfitLabel: Locator;
  readonly chartsRow: Locator;
  readonly topProductsCard: Locator;
  readonly topCustomersCard: Locator;
  readonly topVendorsCard: Locator;
  readonly sidebar: Locator;
  readonly logoutButton: Locator;
  readonly welcomeText: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.locator('.dashboard-header h2');
    this.kpiCards = page.locator('.kpi-card');
    this.totalSalesLabel = page.getByText('Total Sales', { exact: true });
    this.totalSalesValue = page.locator('.kpi-card.kpi-sales .kpi-value');
    this.totalPurchasesLabel = page.getByText('Total Purchases', { exact: true });
    this.productsSoldLabel = page.getByText('Products Sold', { exact: true });
    this.grossProfitLabel = page.getByText('Gross Profit', { exact: true });
    this.chartsRow = page.locator('.chart-card');
    this.topProductsCard = page.locator('.data-card').first();
    this.topCustomersCard = page.locator('.data-card').nth(1);
    this.topVendorsCard = page.locator('.data-card').nth(2);
    this.sidebar = page.locator('#wrapper');
    this.logoutButton = page.locator('.logout-section .nav-link, button:has-text("Logout"), [routerlink="/logout"]');
    this.welcomeText = page.locator('.dashboard-header p.text-muted');
  }

  async goto() {
    await this.page.goto('/dashboard');
  }

  async waitForDashboard() {
    await this.heading.waitFor({ state: 'visible' });
  }

  async getHeadingText() {
    return this.heading.textContent();
  }

  async getWelcomeText() {
    return this.welcomeText.textContent();
  }

  async getKPICount() {
    return this.kpiCards.count();
  }

  async getTotalSalesValue() {
    return this.totalSalesValue.textContent();
  }

  async isKPIDisplayed(label: string) {
    return this.page.getByText(label, { exact: true }).isVisible();
  }

  async getChartCardCount() {
    return this.chartsRow.count();
  }

  async isDataCardDisplayed(title: string) {
    return this.page.locator(`.card-header:has-text("${title}")`).isVisible();
  }

  async clickLogout() {
    await this.logoutButton.click();
  }

  async getSidebarState() {
    return this.sidebar.getAttribute('class');
  }
}
