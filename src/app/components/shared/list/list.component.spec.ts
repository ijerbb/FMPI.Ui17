import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { of, Subject } from 'rxjs';

import { ListComponent } from './list.component';
import { PaginationComponent } from '../../../components/shared/pagination/pagination.component';
import { TransactionListConfig, BulkAction } from '../../../models/dto/transactionListConfigDto';
import { TransactionHeaderDto } from '../../../models/dto/transactionHeaderDto';

describe('ListComponent', () => {
  let component: ListComponent;
  let fixture: ComponentFixture<ListComponent>;

  const mockConfig: TransactionListConfig = {
    moduleType: 'OTHERADJ',
    title: 'Other Adjustment',
    columns: [
      { header: 'Date', field: 'dateIssue', type: 'date' },
      { header: 'Amount', field: 'totalAmount', type: 'currency' }
    ],
    actions: ['edit', 'view'],
    enableBulkActions: true,
    bulkActions: [{ label: 'Delete', action: 'delete' }]
  };

  const mockTransactions: TransactionHeaderDto[] = [
    { sysPK: 1, dateIssue: '2024-01-01', totalAmount: 1000, userPK: 'T001' },
    { sysPK: 2, dateIssue: '2024-01-02', totalAmount: 2000, userPK: 'T002' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterModule.forRoot([]),
        ListComponent,
        PaginationComponent
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ListComponent);
    component = fixture.componentInstance;
    component.config = mockConfig;
    fixture.componentRef.setInput('config', mockConfig);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize search criteria with moduleType', () => {
    expect(component.searchCriteria.moduleType).toBe('OTHERADJ');
  });

  describe('getSearchFieldNames', () => {
    it('should return column headers', () => {
      expect(component.getSearchFieldNames()).toBe('Date, Amount');
    });

    it('should return all fields when no columns', () => {
      component.config.columns = [];
      expect(component.getSearchFieldNames()).toBe('all fields');
    });
  });

  describe('onSearch', () => {
    it('should emit search criteria', () => {
      let emitted: any = undefined;
      component.search.subscribe((data: any) => { emitted = data; });
      component.searchCriteria = {};
      component.onSearch();
      expect(emitted.moduleType).toBe('OTHERADJ');
    });
  });

  describe('onClearSearch', () => {
    it('should reset search input and emit', () => {
      component.searchInput = 'test';
      let emitted: any = undefined;
      component.search.subscribe((data: any) => { emitted = data; });
      component.onClearSearch();
      expect(component.searchInput).toBe('');
      expect(emitted.moduleType).toBe('OTHERADJ');
    });
  });

  describe('pageChange', () => {
    it('should emit page number', () => {
      let emitted: number | undefined;
      component.pageChange.subscribe((data: number) => { emitted = data; });
      component.onPageChange(5);
      expect(emitted).toBe(5);
    });
  });

  describe('action emitters', () => {
    it('should emit newTransaction', () => {
      let emitted: any = undefined;
      component.newTransaction.subscribe(() => { emitted = true; });
      component.onNewTransaction();
      expect(emitted).toBe(true);
    });

    it('should emit editTransaction', () => {
      let emitted: number | undefined;
      component.editTransaction.subscribe((data: number) => { emitted = data; });
      component.onEditTransaction(42);
      expect(emitted).toBe(42);
    });

    it('should emit viewTransaction', () => {
      let emitted: number | undefined;
      component.viewTransaction.subscribe((data: number) => { emitted = data; });
      component.onViewTransaction(42);
      expect(emitted).toBe(42);
    });

    it('should emit printTransaction', () => {
      let emitted: number | undefined;
      component.printTransaction.subscribe((data: number) => { emitted = data; });
      component.onPrintTransaction(42);
      expect(emitted).toBe(42);
    });

    it('should emit voidTransaction', () => {
      let emitted: number | undefined;
      component.voidTransaction.subscribe((data: number) => { emitted = data; });
      component.onVoidTransaction(42);
      expect(emitted).toBe(42);
    });
  });

  describe('toggleSelection', () => {
    it('should add item to selection', () => {
      component.toggleSelection(1);
      expect(component.selectedItems.has(1)).toBe(true);
    });

    it('should remove item from selection', () => {
      component.selectedItems.add(1);
      component.toggleSelection(1);
      expect(component.selectedItems.has(1)).toBe(false);
    });

    it('should do nothing for null id', () => {
      component.toggleSelection(null);
      expect(component.selectedItems.size).toBe(0);
    });
  });

  describe('toggleSelectAll', () => {
    it('should select all items with sysPK', () => {
      component.transactions = mockTransactions;
      component.selectAll = true;
      component.toggleSelectAll();
      expect(component.selectedItems.size).toBe(2);
    });

    it('should clear selection when selectAll is false', () => {
      component.transactions = mockTransactions;
      component.selectedItems.add(1);
      component.selectAll = false;
      component.toggleSelectAll();
      expect(component.selectedItems.size).toBe(0);
    });
  });

  describe('updateSelectAll', () => {
    it('should set selectAll to true when all items selected', () => {
      component.transactions = mockTransactions;
      component.selectedItems.add(1);
      component.selectedItems.add(2);
      component.updateSelectAll();
      expect(component.selectAll).toBe(true);
    });

    it('should set selectAll to false when not all selected', () => {
      component.transactions = mockTransactions;
      component.selectedItems.add(1);
      component.updateSelectAll();
      expect(component.selectAll).toBe(false);
    });

    it('should set selectAll to false when no transactions', () => {
      component.transactions = [];
      component.updateSelectAll();
      expect(component.selectAll).toBe(false);
    });
  });

  describe('onBulkAction', () => {
    it('should emit bulk action with selected ids', () => {
      component.selectedItems.add(1);
      component.selectedItems.add(2);
      let emitted: any = undefined;
      component.bulkAction.subscribe((data: any) => { emitted = data; });
      component.onBulkAction('delete');
      expect(emitted.action).toBe('delete');
      expect(emitted.selectedIds).toEqual([1, 2]);
    });

    it('should close dropdown after action', () => {
      component.showBulkActionDropdown = true;
      component.onBulkAction('delete');
      expect(component.showBulkActionDropdown).toBe(false);
    });
  });

  describe('getColumnValue', () => {
    it('should get simple field value', () => {
      const val = component.getColumnValue({ name: 'test' }, 'name');
      expect(val).toBe('test');
    });

    it('should get nested field value', () => {
      const val = component.getColumnValue({ account: { name: 'Acme' } }, 'account.name');
      expect(val).toBe('Acme');
    });

    it('should return empty for null object', () => {
      const val = component.getColumnValue(null, 'name');
      expect(val).toBe('');
    });

    it('should return empty for undefined object', () => {
      const val = component.getColumnValue(undefined, 'name');
      expect(val).toBe('');
    });
  });

  describe('getItemSysPk', () => {
    it('should return sysPK', () => {
      expect(component.getItemSysPk({ sysPK: 42 })).toBe(42);
    });

    it('should return sysPk (lowercase)', () => {
      expect(component.getItemSysPk({ sysPk: 42 })).toBe(42);
    });
  });

  describe('formatValue', () => {
    it('should return dash for null', () => {
      expect(component.formatValue(null)).toBe('-');
    });

    it('should format currency', () => {
      const result = component.formatValue(1234.5, 'currency');
      expect(result).toContain('₱');
      expect(result).toContain('1,234.50');
    });

    it('should format date', () => {
      const result = component.formatValue('2024-01-15', 'date');
      expect(result).toBeTruthy();
    });

    it('should format number', () => {
      const result = component.formatValue(1234, 'number');
      expect(result).toContain('1,234');
    });
  });

  describe('formatJsonPreview', () => {
    it('should truncate long JSON', () => {
      const longJson = JSON.stringify({ a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 });
      const result = component.formatJsonPreview(longJson);
      expect(result.length).toBeLessThanOrEqual(53);
    });

    it('should return short JSON as-is', () => {
      const result = component.formatJsonPreview('{"a":1}');
      expect(result).toBe('{"a":1}');
    });

    it('should return dash for empty value', () => {
      expect(component.formatJsonPreview('')).toBe('-');
    });
  });

  describe('shouldShowAction', () => {
    it('should return true when no actions defined', () => {
      component.config.actions = undefined;
      expect(component.shouldShowAction('edit')).toBe(true);
    });

    it('should return true when action is in list', () => {
      component.config.actions = ['edit', 'view'];
      expect(component.shouldShowAction('edit')).toBe(true);
    });

    it('should return false when action is not in list', () => {
      component.config.actions = ['edit', 'view'];
      expect(component.shouldShowAction('delete')).toBe(false);
    });
  });
});
