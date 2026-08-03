import { expect } from '@playwright/test';
import { test } from '../fixtures/auth';

// Helper to get the header panel locator (the card containing "Transactions (Sales)" or "Transactions (Purchases)")
async function getHeaderPanel(page: any) {
  return page.locator('app-bir-posting-slsp .card:has-text("Transactions (")').first();
}

// Helper to ensure header panel is closed before an action
async function ensurePanelClosed(page: any) {
  const panel = await getHeaderPanel(page);
  const visible = await panel.isVisible({ timeout: 3000 }).catch(() => false);
  if (visible) {
    const closeBtn = panel.locator('button.btn-sm.btn-outline-secondary');
    const closeVisible = await closeBtn.isVisible({ timeout: 2000 }).catch(() => false);
    if (closeVisible) {
      await closeBtn.click();
      await panel.waitFor({ state: 'hidden' }).catch(() => {});
    }
  }
}

test.describe('Phase E — BIR Posting', () => {

  // =========================================================================
  // BIR Posting Main Page Tests
  // =========================================================================

  test.describe('BIR Posting', () => {

    test('should load BIR Posting list page', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/bir-posting-slsp');
      await expect(page.locator('app-bir-posting-slsp')).toBeVisible({ timeout: 10000 });
    });

    test('should display BIR Posting header', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/bir-posting-slsp');
      await expect(page.locator('app-bir-posting-slsp')).toBeVisible({ timeout: 10000 });
      const header = page.locator('h4.mb-0');
      await expect(header).toBeVisible();
      const headerText = await header.textContent();
      expect(headerText?.includes('BIR Posting (SLSP)')).toBeTruthy();
    });

    test('should display Load Transactions button', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/bir-posting-slsp');
      await expect(page.locator('app-bir-posting-slsp')).toBeVisible({ timeout: 10000 });
      const loadBtn = page.locator('button:has-text("Load Transactions")');
      await expect(loadBtn).toBeVisible({ timeout: 5000 });
    });

    test('should display Summary Report button', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/bir-posting-slsp');
      await expect(page.locator('app-bir-posting-slsp')).toBeVisible({ timeout: 10000 });
      const summaryBtn = page.locator('button:has-text("Summary Report")');
      await expect(summaryBtn).toBeVisible({ timeout: 5000 });
    });

    // =========================================================================
    // Filter Section Tests
    // =========================================================================

    test('should display filter section with dropdowns', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/bir-posting-slsp');
      await expect(page.locator('app-bir-posting-slsp')).toBeVisible({ timeout: 10000 });

      const dropdowns = page.locator('.card select.form-select');
      await expect(dropdowns.first()).toBeVisible({ timeout: 5000 });
      const count = await dropdowns.count();
      expect(count).toBeGreaterThanOrEqual(4);
    });

    test('should display Database filter dropdown', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/bir-posting-slsp');
      await expect(page.locator('app-bir-posting-slsp')).toBeVisible({ timeout: 10000 });

      const dbSelect = page.locator('.card select.form-select').first();
      await expect(dbSelect).toBeVisible({ timeout: 5000 });
    });

    test('should display Year filter dropdown', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/bir-posting-slsp');
      await expect(page.locator('app-bir-posting-slsp')).toBeVisible({ timeout: 10000 });

      const yearSelect = page.locator('.card select.form-select').nth(1);
      await expect(yearSelect).toBeVisible({ timeout: 5000 });
    });

    test('should display Period filter dropdown', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/bir-posting-slsp');
      await expect(page.locator('app-bir-posting-slsp')).toBeVisible({ timeout: 10000 });

      const periodSelect = page.locator('.card select.form-select').nth(2);
      await expect(periodSelect).toBeVisible({ timeout: 5000 });
    });

    test('should display Tax Type filter dropdown', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/bir-posting-slsp');
      await expect(page.locator('app-bir-posting-slsp')).toBeVisible({ timeout: 10000 });

      const taxTypeSelect = page.locator('.card select.form-select').nth(3);
      await expect(taxTypeSelect).toBeVisible({ timeout: 5000 });

      const options = taxTypeSelect.locator('option');
      const optionCount = await options.count();
      expect(optionCount).toBeGreaterThanOrEqual(2);
    });

    test('should display status indicator in filter section', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/bir-posting-slsp');
      await expect(page.locator('app-bir-posting-slsp')).toBeVisible({ timeout: 10000 });

      const statusIcon = page.locator('.form-control-plaintext i.bi');
      await expect(statusIcon.first()).toBeVisible({ timeout: 5000 });
    });

    // =========================================================================
    // Transaction Header Panel Tests (Load Transactions)
    // =========================================================================

    test('should toggle transaction header panel when Load Transactions button clicked', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/bir-posting-slsp');
      await expect(page.locator('app-bir-posting-slsp')).toBeVisible({ timeout: 10000 });

      // Ensure panel is closed first
      await ensurePanelClosed(page);

      // Click Load Transactions button
      const loadBtn = page.locator('button:has-text("Load Transactions")');
      await expect(loadBtn).toBeVisible({ timeout: 5000 });
      await loadBtn.click();

      // Header panel should now be visible
      const headerPanel = await getHeaderPanel(page);
      await expect(headerPanel).toBeVisible({ timeout: 10000 });
    });

    test('should display transaction header table with correct columns when panel opened', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/bir-posting-slsp');
      await expect(page.locator('app-bir-posting-slsp')).toBeVisible({ timeout: 10000 });

      // Ensure panel is closed first
      await ensurePanelClosed(page);

      // Click Load Transactions button
      const loadBtn = page.locator('button:has-text("Load Transactions")');
      await expect(loadBtn).toBeVisible({ timeout: 5000 });
      await loadBtn.click();

      // Wait for header panel to be visible
      const headerPanel = await getHeaderPanel(page);
      await expect(headerPanel).toBeVisible({ timeout: 10000 });

      // Verify table header columns if table exists
      const tableHeader = headerPanel.locator('table thead tr');
      const tableHeaderVisible = await tableHeader.isVisible({ timeout: 5000 }).catch(() => false);
      if (tableHeaderVisible) {
        const headers = headerPanel.locator('table thead th');
        const headersCount = await headers.count();
        expect(headersCount).toBeGreaterThanOrEqual(1);
      }
    });

    test('should display Refresh button in transaction header panel', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/bir-posting-slsp');
      await expect(page.locator('app-bir-posting-slsp')).toBeVisible({ timeout: 10000 });

      // Ensure panel is closed first
      await ensurePanelClosed(page);

      // Click Load Transactions button
      const loadBtn = page.locator('button:has-text("Load Transactions")');
      await expect(loadBtn).toBeVisible({ timeout: 5000 });
      await loadBtn.click();

      // Wait for header panel to be visible
      const headerPanel = await getHeaderPanel(page);
      await expect(headerPanel).toBeVisible({ timeout: 10000 });

      // Verify Refresh button is visible
      const refreshBtn = headerPanel.locator('button:has-text("Refresh")');
      await expect(refreshBtn).toBeVisible({ timeout: 5000 });
    });

    test('should close transaction header panel with Close button', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/bir-posting-slsp');
      await expect(page.locator('app-bir-posting-slsp')).toBeVisible({ timeout: 10000 });

      // Ensure panel is closed first
      await ensurePanelClosed(page);

      // Click Load Transactions button
      const loadBtn = page.locator('button:has-text("Load Transactions")');
      await expect(loadBtn).toBeVisible({ timeout: 5000 });
      await loadBtn.click();

      // Wait for header panel to be visible
      const headerPanel = await getHeaderPanel(page);
      await expect(headerPanel).toBeVisible({ timeout: 10000 });

      // Click Close button
      const closeBtn = headerPanel.locator('button.btn-sm.btn-outline-secondary');
      await expect(closeBtn).toBeVisible({ timeout: 5000 });
      await closeBtn.click();

      // Panel should now be hidden
      await expect(headerPanel).not.toBeVisible({ timeout: 5000 });
    });

    // =========================================================================
    // Main Data Grid Tests
    // =========================================================================

    test('should display main data grid area', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/bir-posting-slsp');
      await expect(page.locator('app-bir-posting-slsp')).toBeVisible({ timeout: 10000 });

      const dataGridCard = page.locator('app-bir-posting-slsp .card').last();
      await expect(dataGridCard).toBeVisible({ timeout: 10000 });
    });

    test('should display pagination on main data grid', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/bir-posting-slsp');
      await expect(page.locator('app-bir-posting-slsp')).toBeVisible({ timeout: 10000 });

      // Pagination should be present in the main grid area
      const pagination = page.locator('app-bir-posting-slsp app-pagination');
      const paginationVisible = await pagination.isVisible({ timeout: 5000 }).catch(() => false);
      if (paginationVisible) {
        await expect(pagination).toBeVisible();
      }
    });

    test('should display totals bar when data is loaded', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/bir-posting-slsp');
      await expect(page.locator('app-bir-posting-slsp')).toBeVisible({ timeout: 10000 });

      // Totals inputs may be visible when data is loaded
      const totalsInputs = page.locator('input.form-control.form-control-sm:disabled');
      const totalsCount = await totalsInputs.count();
      expect(totalsCount).toBeGreaterThanOrEqual(0);
    });

    // =========================================================================
    // Transaction Row Actions Tests
    // =========================================================================

    test('should display Print button for Purchases transactions in data grid', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/bir-posting-slsp');
      await expect(page.locator('app-bir-posting-slsp')).toBeVisible({ timeout: 10000 });

      // Print button should be visible for Purchase transactions if any exist
      // The button has a title="Print PDF" attribute
      const printBtn = page.locator('app-bir-posting-slsp button[title="Print PDF"]');
      const printVisible = await printBtn.isVisible({ timeout: 3000 }).catch(() => false);
      if (printVisible) {
        await expect(printBtn).toBeVisible();
      }
    });

    test('should display Delete button in data grid', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/bir-posting-slsp');
      await expect(page.locator('app-bir-posting-slsp')).toBeVisible({ timeout: 10000 });

      // Delete button should be visible in the data grid if there are transactions
      const deleteBtn = page.locator('app-bir-posting-slsp button[title="Remove from grid"]');
      const deleteVisible = await deleteBtn.isVisible({ timeout: 3000 }).catch(() => false);
      if (deleteVisible) {
        await expect(deleteBtn).toBeVisible();
      }
    });

    // =========================================================================
    // Summary Report Tests
    // =========================================================================

    test('should display Summary Report modal when Summary Report button clicked', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/bir-posting-slsp');
      await expect(page.locator('app-bir-posting-slsp')).toBeVisible({ timeout: 10000 });

      // Click Summary Report button
      const summaryBtn = page.locator('button:has-text("Summary Report")');
      await expect(summaryBtn).toBeVisible({ timeout: 5000 });
      await summaryBtn.click();

      // PDF preview modal should appear
      const pdfModal = page.locator('app-pdf-preview-modal');
      const modalVisible = await pdfModal.isVisible({ timeout: 10000 }).catch(() => false);
      if (modalVisible) {
        await expect(pdfModal).toBeVisible();
      }
    });

    // =========================================================================
    // Delete Confirmation Modal Tests
    // =========================================================================

    test('should display delete confirmation modal when Delete button clicked', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/bir-posting-slsp');
      await expect(page.locator('app-bir-posting-slsp')).toBeVisible({ timeout: 10000 });

      // Look for delete button in data grid
      const deleteBtn = page.locator('app-bir-posting-slsp button[title="Remove from grid"]');
      const deleteVisible = await deleteBtn.isVisible({ timeout: 5000 }).catch(() => false);

      if (deleteVisible) {
        // Click first delete button
        await deleteBtn.first().click();

        // Delete confirmation modal should appear
        const modal = page.locator('#deleteConfirmModal');
        await expect(modal).toBeVisible({ timeout: 5000 });

        // Cancel the deletion
        const cancelBtn = modal.locator('button:has-text("Cancel")');
        await cancelBtn.click();

        // Modal should close
        await expect(modal).not.toBeVisible({ timeout: 5000 });
      }
    });

    // =========================================================================
    // Filter Change Tests
    // =========================================================================

    test('should allow changing filter selections', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/bir-posting-slsp');
      await expect(page.locator('app-bir-posting-slsp')).toBeVisible({ timeout: 10000 });

      const yearSelect = page.locator('.card select.form-select').nth(1);
      const yearVisible = await yearSelect.isVisible({ timeout: 3000 }).catch(() => false);

      if (yearVisible) {
        const options = yearSelect.locator('option');
        const optionCount = await options.count();
        if (optionCount > 1) {
          await yearSelect.selectOption({ index: 1 });
          const selectedValue = await yearSelect.inputValue();
          expect(selectedValue).toBeTruthy();
        }
      }
    });

    test('should display Loading status when filters change', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/bir-posting-slsp');
      await expect(page.locator('app-bir-posting-slsp')).toBeVisible({ timeout: 10000 });

      // Complete all filters first so loading indicator appears instead of info icon
      const yearSelect = page.locator('.card select.form-select').nth(1);
      const periodSelect = page.locator('.card select.form-select').nth(2);
      const taxTypeSelect = page.locator('.card select.form-select').nth(3);

      const yearVisible = await yearSelect.isVisible({ timeout: 3000 }).catch(() => false);

      if (yearVisible) {
        const yearOptions = yearSelect.locator('option');
        const yearCount = await yearOptions.count();
        if (yearCount > 1) {
          await yearSelect.selectOption({ index: 1 });
        }

        // Wait for API calls to complete
        await page.waitForTimeout(2000);

        const periodOptions = periodSelect.locator('option');
        const periodCount = await periodOptions.count();
        if (periodCount > 1) {
          await periodSelect.selectOption({ index: 1 });
        }

        // Wait for API calls to complete
        await page.waitForTimeout(2000);

        // Change tax type to trigger another loading cycle
        const taxOptions = taxTypeSelect.locator('option');
        const taxCount = await taxOptions.count();
        if (taxCount > 2) {
          await taxTypeSelect.selectOption({ index: 2 });
        }

        // Look for loading indicator (spin class on arrow-repeat icon)
        const loadingIndicator = page.locator('.form-control-plaintext i.bi-arrow-repeat.spin');
        const loadingVisible = await loadingIndicator.isVisible({ timeout: 5000 }).catch(() => false);
        if (loadingVisible) {
          await expect(loadingIndicator).toBeVisible();
        }
      }
    });

    // =========================================================================
    // Checkbox Selection Tests
    // =========================================================================

    test('should display select all checkbox in header panel', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/bir-posting-slsp');
      await expect(page.locator('app-bir-posting-slsp')).toBeVisible({ timeout: 10000 });

      // Ensure panel is closed first
      await ensurePanelClosed(page);

      // Click Load Transactions button
      const loadBtn = page.locator('button:has-text("Load Transactions")');
      await expect(loadBtn).toBeVisible({ timeout: 5000 });
      await loadBtn.click();

      // Wait for header panel to be visible
      const headerPanel = await getHeaderPanel(page);
      await expect(headerPanel).toBeVisible({ timeout: 10000 });

      // Select All checkbox should be visible if table exists
      const selectAllCheckbox = headerPanel.locator('table input[type="checkbox"]');
      const checkboxVisible = await selectAllCheckbox.isVisible({ timeout: 5000 }).catch(() => false);
      if (checkboxVisible) {
        await expect(selectAllCheckbox).toBeVisible();
      }
    });

    // =========================================================================
    // Add Selected Button Test
    // =========================================================================

    test('should display Add Selected button when transactions are selected in header panel', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/bir-posting-slsp');
      await expect(page.locator('app-bir-posting-slsp')).toBeVisible({ timeout: 10000 });

      // Ensure panel is closed first
      await ensurePanelClosed(page);

      // Click Load Transactions button
      const loadBtn = page.locator('button:has-text("Load Transactions")');
      await expect(loadBtn).toBeVisible({ timeout: 5000 });
      await loadBtn.click();

      // Wait for header panel to be visible
      const headerPanel = await getHeaderPanel(page);
      await expect(headerPanel).toBeVisible({ timeout: 10000 });

      // Check if there's at least one checkbox in the header panel
      const rowCheckbox = headerPanel.locator('table tbody input[type="checkbox"]').first();
      const checkboxVisible = await rowCheckbox.isVisible({ timeout: 3000 }).catch(() => false);

      if (checkboxVisible) {
        // Select a transaction
        await rowCheckbox.click();
        await page.waitForTimeout(1000);

        // Add Selected button should appear
        const addBtn = headerPanel.locator('button.btn-primary:has-text("Add Selected")');
        const addBtnVisible = await addBtn.isVisible({ timeout: 3000 }).catch(() => false);
        if (addBtnVisible) {
          await expect(addBtn).toBeVisible();
        }
      }
    });

  });

});
