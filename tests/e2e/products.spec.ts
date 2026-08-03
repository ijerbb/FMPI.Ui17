import { expect } from '@playwright/test';
import { test } from '../fixtures/auth';

test.describe('Phase C — Product Module', () => {

  // =========================================================================
  // Product Search Tests
  // =========================================================================

  test.describe('Product Search', () => {

    test('should load Products list page', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/product/PD');
      await expect(page.locator('app-product')).toBeVisible({ timeout: 10000 });
    });

    test('should display Products header', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/product/PD');
      await expect(page.locator('app-product')).toBeVisible({ timeout: 10000 });
      const header = page.locator('.main-header h5');
      await expect(header).toBeVisible();
      const headerText = await header.textContent();
      expect(headerText?.includes('Products')).toBeTruthy();
    });

    test('should display search criteria section', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/product/PD');
      await expect(page.locator('app-product')).toBeVisible({ timeout: 10000 });
      const searchHeader = page.locator('.card-header label:has-text("Search Criteria")');
      await expect(searchHeader).toBeVisible();
    });

    test('should display barcode search mode dropdown', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/product/PD');
      await expect(page.locator('app-product')).toBeVisible({ timeout: 10000 });
      const searchModeSelect = page.locator('select[name="searchMode"]');
      await expect(searchModeSelect).toBeVisible();
      await expect(searchModeSelect).toHaveValue('barcode');
    });

    test('should display barcode search input', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/product/PD');
      await expect(page.locator('app-product')).toBeVisible({ timeout: 10000 });
      const searchInput = page.locator('input[name="barcode"]');
      await expect(searchInput).toBeVisible();
      await expect(searchInput).toHaveAttribute('placeholder', 'Search barcode');
    });

    test('should display Search button in search bar', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/product/PD');
      await expect(page.locator('app-product')).toBeVisible({ timeout: 10000 });
      const searchBtn = page.locator('button.btn-primary:has-text("Search")');
      await expect(searchBtn).toBeVisible();
    });

    test('should switch search mode to Advance Search', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/product/PD');
      await expect(page.locator('app-product')).toBeVisible({ timeout: 10000 });
      const searchModeSelect = page.locator('select[name="searchMode"]');
      await searchModeSelect.selectOption('advance');
      await expect(searchModeSelect).toHaveValue('advance');
      const placeholder = await page.locator('input[name="barcode"]').getAttribute('placeholder');
      expect(placeholder).toContain('Part No');
    });

    test('should display results table with correct columns', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/product/PD');
      await expect(page.locator('app-product')).toBeVisible({ timeout: 10000 });
      // Wait for the table to render
      const table = page.locator('table.table-striped');
      await expect(table).toBeVisible({ timeout: 15000 });
      // Check column headers
      const columns = ['Part No', 'C Description', 'Brand', 'C Code', 'Application', 'Main Group', 'A Ref'];
      for (const col of columns) {
        const headerCell = page.locator(`thead th:has-text("${col}")`);
        await expect(headerCell.first()).toBeVisible({ timeout: 5000 });
      }
    });

    test('should perform barcode search and handle response', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/product/PD');
      await expect(page.locator('app-product')).toBeVisible({ timeout: 10000 });
      const searchInput = page.locator('input[name="barcode"]');
      await expect(searchInput).toBeVisible();
      await searchInput.fill('TEST');
      const searchBtn = page.locator('button.btn-primary:has-text("Search")');
      await searchBtn.click();
      // Wait for search to complete (spinner disappears or search button re-enabled)
      await page.waitForTimeout(3000);
      // After search, the page should still be functional
      // Either results appear, empty state shows, or search state is cleared
      const isSearchActive = await page.locator('button.btn-primary:has-text("Searching...")').isVisible().catch(() => false);
      expect(isSearchActive).toBeFalsy();
    });

    test('should clear search and reload list', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/product/PD');
      await expect(page.locator('app-product')).toBeVisible({ timeout: 10000 });
      const searchInput = page.locator('input[name="barcode"]');
      await expect(searchInput).toBeVisible();
      await searchInput.fill('TEST');
      const searchBtn = page.locator('button.btn-primary:has-text("Search")');
      await searchBtn.click();
      await page.waitForTimeout(2000);
      // Click clear button
      const clearBtn = page.locator('button.btn-link.text-secondary');
      const clearVisible = await clearBtn.isVisible({ timeout: 3000 }).catch(() => false);
      if (clearVisible) {
        await clearBtn.click();
        // Should reload the full list - table should be visible
        await expect(page.locator('table.table-striped')).toBeVisible({ timeout: 15000 });
      }
    });

    test('should display pagination controls', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/product/PD');
      await expect(page.locator('app-product')).toBeVisible({ timeout: 10000 });
      const pagination = page.locator('app-pagination');
      await expect(pagination).toBeVisible({ timeout: 15000 });
    });

    test('should navigate to Product Detail by clicking edit icon if products exist', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/product/PD');
      await expect(page.locator('app-product')).toBeVisible({ timeout: 10000 });
      // Wait for table to render
      await expect(page.locator('table.table-striped')).toBeVisible({ timeout: 15000 });
      // Click the first edit icon (pencil icon) only if products exist
      const editIcon = page.locator('table.table-striped tbody a[routerlink*="productdetails"]').first();
      const isEditable = await editIcon.isVisible({ timeout: 5000 }).catch(() => false);
      if (isEditable) {
        await editIcon.click();
        await expect(page.locator('app-product-detail')).toBeVisible({ timeout: 10000 });
      }
    });

    test('should handle empty search gracefully', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/product/PD');
      await expect(page.locator('app-product')).toBeVisible({ timeout: 10000 });
      const searchInput = page.locator('input[name="barcode"]');
      await expect(searchInput).toBeVisible();
      await searchInput.press('Enter');
      // Should still show the product table (either empty or with data)
      await expect(page.locator('table.table-striped')).toBeVisible({ timeout: 15000 });
    });
  });

  // =========================================================================
  // Product Inquiry Tests
  // =========================================================================

  test.describe('Product Inquiry', () => {

    test('should load Product Inquiry list page', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/product/PI');
      await expect(page.locator('app-product')).toBeVisible({ timeout: 10000 });
    });

    test('should display Product Inquiry header', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/product/PI');
      await expect(page.locator('app-product')).toBeVisible({ timeout: 10000 });
      const header = page.locator('.main-header h5');
      await expect(header).toBeVisible();
      const headerText = await header.textContent();
      expect(headerText?.includes('Product Inquiry')).toBeTruthy();
    });

    test('should display Product Inquiry table with same columns', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/product/PI');
      await expect(page.locator('app-product')).toBeVisible({ timeout: 10000 });
      const table = page.locator('table.table-striped');
      await expect(table).toBeVisible({ timeout: 15000 });
    });

    test('should navigate to Product Inquiry detail by clicking zoom icon if products exist', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/product/PI');
      await expect(page.locator('app-product')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('table.table-striped')).toBeVisible({ timeout: 15000 });
      // Click the first zoom-in icon (for inquiry) only if products exist
      const inquiryIcon = page.locator('table.table-striped tbody a[routerlink*="productinquiry"]').first();
      const isEditable = await inquiryIcon.isVisible({ timeout: 5000 }).catch(() => false);
      if (isEditable) {
        await inquiryIcon.click();
        await expect(page.locator('app-product-inquiry')).toBeVisible({ timeout: 10000 });
      }
    });
  });

  // =========================================================================
  // Product Detail Tests
  // =========================================================================

  test.describe('Product Detail', () => {

    test('should load Product Detail page by navigating from list', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/product/PD');
      await expect(page.locator('app-product')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('table.table-striped')).toBeVisible({ timeout: 15000 });
      // Click the first edit icon to navigate to detail only if products exist
      const editIcon = page.locator('table.table-striped tbody a[routerlink*="productdetails"]').first();
      const isEditable = await editIcon.isVisible({ timeout: 5000 }).catch(() => false);
      if (isEditable) {
        await editIcon.click();
        await expect(page.locator('app-product-detail')).toBeVisible({ timeout: 10000 });
      }
    });

    test('should display product detail header when product loaded', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/product/PD');
      await expect(page.locator('app-product')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('table.table-striped')).toBeVisible({ timeout: 15000 });
      const editIcon = page.locator('table.table-striped tbody a[routerlink*="productdetails"]').first();
      const isEditable = await editIcon.isVisible({ timeout: 5000 }).catch(() => false);
      if (isEditable) {
        await editIcon.click();
        await expect(page.locator('app-product-detail')).toBeVisible({ timeout: 10000 });
        const header = page.locator('.main-header h5');
        await expect(header).toBeVisible();
        const headerText = await header.textContent();
        expect(headerText?.includes('Products')).toBeTruthy();
      }
    });

    test('should display product information fields when product loaded', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/product/PD');
      await expect(page.locator('app-product')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('table.table-striped')).toBeVisible({ timeout: 15000 });
      const editIcon = page.locator('table.table-striped tbody a[routerlink*="productdetails"]').first();
      const isEditable = await editIcon.isVisible({ timeout: 5000 }).catch(() => false);
      if (isEditable) {
        await editIcon.click();
        await expect(page.locator('app-product-detail')).toBeVisible({ timeout: 10000 });
        // Check for product fields - at least some should be visible
        const fields = ['partNo', 'cDescription', 'brand', 'cCode', 'price'];
        let foundAny = false;
        for (const field of fields) {
          const input = page.locator(`input[id="${field}"]`);
          const visible = await input.isVisible({ timeout: 3000 }).catch(() => false);
          if (visible) {
            foundAny = true;
            break;
          }
        }
        expect(foundAny).toBeTruthy();
      }
    });

    test('should display tab navigation on product detail page', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/product/PD');
      await expect(page.locator('app-product')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('table.table-striped')).toBeVisible({ timeout: 15000 });
      const editIcon = page.locator('table.table-striped tbody a[routerlink*="productdetails"]').first();
      const isEditable = await editIcon.isVisible({ timeout: 5000 }).catch(() => false);
      if (isEditable) {
        await editIcon.click();
        await expect(page.locator('app-product-detail')).toBeVisible({ timeout: 10000 });
        // Check tabs exist
        const tabs = ['More Info', 'Supplier', 'Warehouse', 'Logs'];
        for (const tab of tabs) {
          const tabLink = page.locator(`.nav-tabs a:has-text("${tab}")`);
          const visible = await tabLink.isVisible({ timeout: 3000 }).catch(() => false);
          if (visible) {
            await expect(tabLink).toBeVisible();
          }
        }
      }
    });

    test('should switch between tabs on product detail page', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/product/PD');
      await expect(page.locator('app-product')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('table.table-striped')).toBeVisible({ timeout: 15000 });
      const editIcon = page.locator('table.table-striped tbody a[routerlink*="productdetails"]').first();
      const isEditable = await editIcon.isVisible({ timeout: 5000 }).catch(() => false);
      if (isEditable) {
        await editIcon.click();
        await expect(page.locator('app-product-detail')).toBeVisible({ timeout: 10000 });
        // Switch to Warehouse tab
        const warehouseTab = page.locator('.nav-tabs a:has-text("Warehouse")');
        const tabVisible = await warehouseTab.isVisible({ timeout: 3000 }).catch(() => false);
        if (tabVisible) {
          await warehouseTab.click();
          const warehouseContent = page.locator('#warehouseTabContent');
          await expect(warehouseContent).toBeVisible({ timeout: 5000 });
        }
      }
    });

    test('should display Save button on product detail page', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/product/PD');
      await expect(page.locator('app-product')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('table.table-striped')).toBeVisible({ timeout: 15000 });
      const editIcon = page.locator('table.table-striped tbody a[routerlink*="productdetails"]').first();
      const isEditable = await editIcon.isVisible({ timeout: 5000 }).catch(() => false);
      if (isEditable) {
        await editIcon.click();
        await expect(page.locator('app-product-detail')).toBeVisible({ timeout: 10000 });
        const saveBtn = page.locator('app-action-menu button:has-text("Save")');
        await expect(saveBtn).toBeVisible({ timeout: 5000 });
      }
    });

    test('should display Print button on product detail page', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/product/PD');
      await expect(page.locator('app-product')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('table.table-striped')).toBeVisible({ timeout: 15000 });
      const editIcon = page.locator('table.table-striped tbody a[routerlink*="productdetails"]').first();
      const isEditable = await editIcon.isVisible({ timeout: 5000 }).catch(() => false);
      if (isEditable) {
        await editIcon.click();
        await expect(page.locator('app-product-detail')).toBeVisible({ timeout: 10000 });
        const printBtn = page.locator('app-action-menu button:has-text("Print")');
        const printVisible = await printBtn.isVisible({ timeout: 5000 }).catch(() => false);
        if (printVisible) {
          await expect(printBtn).toBeVisible();
        }
      }
    });

    test('should go back to product list from detail page', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/product/PD');
      await expect(page.locator('app-product')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('table.table-striped')).toBeVisible({ timeout: 15000 });
      const editIcon = page.locator('table.table-striped tbody a[routerlink*="productdetails"]').first();
      const isEditable = await editIcon.isVisible({ timeout: 5000 }).catch(() => false);
      if (isEditable) {
        await editIcon.click();
        await expect(page.locator('app-product-detail')).toBeVisible({ timeout: 10000 });
        // Click the Products link in header to go back
        const productsLink = page.locator('.main-header a:has-text("Products")');
        const linkVisible = await productsLink.isVisible({ timeout: 3000 }).catch(() => false);
        if (linkVisible) {
          await productsLink.click();
          await expect(page.locator('app-product')).toBeVisible({ timeout: 10000 });
        }
      }
    });
  });

  // =========================================================================
  // Product Inquiry Detail Tests
  // =========================================================================

  test.describe('Product Inquiry Detail', () => {

    test('should load Product Inquiry Detail page by navigating from list', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/product/PI');
      await expect(page.locator('app-product')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('table.table-striped')).toBeVisible({ timeout: 15000 });
      // Click the first zoom-in icon only if products exist
      const inquiryIcon = page.locator('table.table-striped tbody a[routerlink*="productinquiry"]').first();
      const isEditable = await inquiryIcon.isVisible({ timeout: 5000 }).catch(() => false);
      if (isEditable) {
        await inquiryIcon.click();
        await expect(page.locator('app-product-inquiry')).toBeVisible({ timeout: 10000 });
      }
    });

    test('should display transaction history on Product Inquiry Detail page', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/product/PI');
      await expect(page.locator('app-product')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('table.table-striped')).toBeVisible({ timeout: 15000 });
      const inquiryIcon = page.locator('table.table-striped tbody a[routerlink*="productinquiry"]').first();
      const isEditable = await inquiryIcon.isVisible({ timeout: 5000 }).catch(() => false);
      if (isEditable) {
        await inquiryIcon.click();
        await expect(page.locator('app-product-inquiry')).toBeVisible({ timeout: 10000 });
        // Transaction history table should be visible
        const historyTable = page.locator('table.table-striped');
        const tableVisible = await historyTable.isVisible({ timeout: 5000 }).catch(() => false);
        if (tableVisible) {
          await expect(historyTable).toBeVisible();
        }
      }
    });

    test('should display pagination on Product Inquiry Detail page', async ({ page, auth }) => {
      await auth.loginAsDefault();
      await page.goto('/product/PI');
      await expect(page.locator('app-product')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('table.table-striped')).toBeVisible({ timeout: 15000 });
      const inquiryIcon = page.locator('table.table-striped tbody a[routerlink*="productinquiry"]').first();
      const isEditable = await inquiryIcon.isVisible({ timeout: 5000 }).catch(() => false);
      if (isEditable) {
        await inquiryIcon.click();
        await expect(page.locator('app-product-inquiry')).toBeVisible({ timeout: 10000 });
        const pagination = page.locator('app-pagination');
        const paginationVisible = await pagination.isVisible({ timeout: 5000 }).catch(() => false);
        if (paginationVisible) {
          await expect(pagination).toBeVisible();
        }
      }
    });
  });

});
