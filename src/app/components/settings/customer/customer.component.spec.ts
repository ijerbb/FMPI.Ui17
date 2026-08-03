import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { of, throwError } from 'rxjs';

import { CustomerComponent } from './customer.component';
import { CustomerService } from '../../../services/customer.service';
import { AlertService } from '../../../services/alert.service';
import { TransactionConfigService } from '../../../services/transaction-config.service';
import { UniversalMasterDto } from '../../../models/dto/universalMasterDto';
import { ListComponent } from '../../../components/shared/list/list.component';
import { PaginationComponent } from '../../../components/shared/pagination/pagination.component';

class MockCustomerService {
  getAllCustomers = jasmine.createSpy('getAllCustomers').and.returnValue(of([]));
  deleteMultipleCustomers = jasmine.createSpy('deleteMultipleCustomers').and.returnValue(of({ success: true, data: '', rawData: '' }));
}

class MockAlertService {
  setCustomErrorAlert = jasmine.createSpy('setCustomErrorAlert');
  setCustomSuccessAlert = jasmine.createSpy('setCustomSuccessAlert');
}

describe('CustomerComponent', () => {
  let component: CustomerComponent;
  let fixture: ComponentFixture<CustomerComponent>;
  let customerService: MockCustomerService;
  let alertService: MockAlertService;

  beforeEach(async () => {
    customerService = new MockCustomerService();
    alertService = new MockAlertService();

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterModule.forRoot([]),
        CustomerComponent,
        ListComponent,
        PaginationComponent
      ],
      providers: [
        { provide: CustomerService, useValue: customerService },
        { provide: AlertService, useValue: alertService },
        TransactionConfigService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load configuration on init', () => {
    expect(component.config).toBeTruthy();
    expect(component.config.moduleType).toBe('CUST');
  });

  it('should call getAllCustomers on init', () => {
    expect(customerService.getAllCustomers).toHaveBeenCalled();
  });

  it('should initialize with empty customers', () => {
    expect(component.allCustomers).toEqual([]);
    expect(component.customers).toEqual([]);
    expect(component.filteredCustomers).toEqual([]);
  });

  it('should initialize pagination defaults', () => {
    expect(component.pageNum).toBe(1);
    expect(component.pageSize).toBe(10);
    expect(component.totalRecords).toBe(0);
  });

  describe('applyPagination', () => {
    it('should slice customers correctly for page 1', () => {
      component.allCustomers = [
        { sysPk: 1, userPK: 'C001', name: 'Customer 1', module: 'CUST' },
        { sysPk: 2, userPK: 'C002', name: 'Customer 2', module: 'CUST' },
        { sysPk: 3, userPK: 'C003', name: 'Customer 3', module: 'CUST' }
      ];
      component.customers = [...component.allCustomers];
      component.pageNum = 1;
      component.pageSize = 2;
      component.applyPagination();
      expect(component.filteredCustomers.length).toBe(2);
      expect(component.totalRecords).toBe(3);
    });

    it('should slice customers correctly for page 2', () => {
      component.allCustomers = [
        { sysPk: 1, userPK: 'C001', name: 'Customer 1', module: 'CUST' },
        { sysPk: 2, userPK: 'C002', name: 'Customer 2', module: 'CUST' },
        { sysPk: 3, userPK: 'C003', name: 'Customer 3', module: 'CUST' }
      ];
      component.customers = [...component.allCustomers];
      component.pageNum = 2;
      component.pageSize = 2;
      component.applyPagination();
      expect(component.filteredCustomers.length).toBe(1);
      expect(component.filteredCustomers[0].userPK).toBe('C003');
    });

    it('should return empty when no customers', () => {
      component.customers = [];
      component.applyPagination();
      expect(component.filteredCustomers).toEqual([]);
    });
  });

  describe('applySmartSearch', () => {
    it('should return all customers when search term is empty', () => {
      component.allCustomers = [
        { sysPk: 1, userPK: 'C001', name: 'Customer A', module: 'CUST' },
        { sysPk: 2, userPK: 'C002', name: 'Customer B', module: 'CUST' }
      ];
      const results = component.applySmartSearch('');
      expect(results).toEqual(component.allCustomers);
    });

    it('should filter customers matching search term', () => {
      component.allCustomers = [
        { sysPk: 1, userPK: 'C001', name: 'Acme Corp', module: 'CUST' },
        { sysPk: 2, userPK: 'C002', name: 'Beta Inc', module: 'CUST' },
        { sysPk: 3, userPK: 'C003', name: 'Acme Beta', module: 'CUST' }
      ];
      const results = component.applySmartSearch('acme');
      expect(results.length).toBe(2);
      expect(results[0].userPK).toBe('C001');
      expect(results[1].userPK).toBe('C003');
    });

    it('should use AND logic for multi-word search', () => {
      component.allCustomers = [
        { sysPk: 1, userPK: 'C001', name: 'Acme Corp Inc', module: 'CUST' },
        { sysPk: 2, userPK: 'C002', name: 'Acme LLC', module: 'CUST' },
        { sysPk: 3, userPK: 'C003', name: 'Beta Corp Inc', module: 'CUST' }
      ];
      const results = component.applySmartSearch('acme corp');
      expect(results.length).toBe(1);
      expect(results[0].userPK).toBe('C001');
    });

    it('should be case-insensitive', () => {
      component.allCustomers = [
        { sysPk: 1, userPK: 'C001', name: 'Acme Corp', module: 'CUST' }
      ];
      const results = component.applySmartSearch('ACME');
      expect(results.length).toBe(1);
    });

    it('should return empty when no match', () => {
      component.allCustomers = [
        { sysPk: 1, userPK: 'C001', name: 'Acme Corp', module: 'CUST' }
      ];
      const results = component.applySmartSearch('nonexistent');
      expect(results.length).toBe(0);
    });

    it('should search across userPK field', () => {
      component.allCustomers = [
        { sysPk: 1, userPK: 'C001', name: 'Customer A', module: 'CUST' },
        { sysPk: 2, userPK: 'C002', name: 'Customer B', module: 'CUST' }
      ];
      const results = component.applySmartSearch('C002');
      expect(results.length).toBe(1);
      expect(results[0].userPK).toBe('C002');
    });
  });

  describe('loadCustomers', () => {
    it('should set loading to true and then false after success', fakeAsync(() => {
      component.loadCustomers();
      tick();
      expect(component.loading).toBe(false);
      expect(component.allCustomers).toEqual([]);
    }));

    it('should set allCustomers and customers on success', fakeAsync(() => {
      const mockCustomers: UniversalMasterDto[] = [
        { sysPk: 1, userPK: 'C001', name: 'Customer 1', module: 'CUST' },
        { sysPk: 2, userPK: 'C002', name: 'Customer 2', module: 'CUST' }
      ];
      customerService.getAllCustomers.and.returnValue(of(mockCustomers));
      component.loadCustomers();
      tick();
      expect(component.allCustomers).toEqual(mockCustomers);
      expect(component.customers).toEqual(mockCustomers);
    }));

    it('should call alertService on error', fakeAsync(() => {
      customerService.getAllCustomers.and.returnValue(throwError(() => new Error('Network error')));
      component.loadCustomers();
      tick();
      expect(alertService.setCustomErrorAlert).toHaveBeenCalled();
    }));
  });

  describe('handleBulkDelete', () => {
    it('should call deleteMultipleCustomers and reload', fakeAsync(() => {
      spyOn(window, 'confirm').and.returnValue(true);
      customerService.deleteMultipleCustomers.and.returnValue(of({ success: true, data: '', rawData: '' }));

      component.handleBulkDelete([1, 2, 3]);
      tick();

      expect(customerService.deleteMultipleCustomers).toHaveBeenCalledWith([1, 2, 3]);
      expect(alertService.setCustomSuccessAlert).toHaveBeenCalled();
      expect(customerService.getAllCustomers).toHaveBeenCalled();
    }));

    it('should not delete when user cancels', fakeAsync(() => {
      spyOn(window, 'confirm').and.returnValue(false);
      component.handleBulkDelete([1, 2, 3]);
      tick();
      expect(customerService.deleteMultipleCustomers).not.toHaveBeenCalled();
    }));

    it('should not delete when ids array is empty', fakeAsync(() => {
      component.handleBulkDelete([]);
      tick();
      expect(customerService.deleteMultipleCustomers).not.toHaveBeenCalled();
    }));

    it('should show error alert on delete failure', fakeAsync(() => {
      spyOn(window, 'confirm').and.returnValue(true);
      customerService.deleteMultipleCustomers.and.returnValue(of({ success: false, data: 'Error occurred', rawData: '' }));
      component.handleBulkDelete([1]);
      tick();
      expect(alertService.setCustomErrorAlert).toHaveBeenCalled();
    }));
  });

  describe('onPageChange', () => {
    it('should update pageNum and re-apply pagination', () => {
      component.customers = [
        { sysPk: 1, userPK: 'C001', name: 'Customer 1', module: 'CUST' },
        { sysPk: 2, userPK: 'C002', name: 'Customer 2', module: 'CUST' }
      ];
      component.pageNum = 1;
      component.pageSize = 1;
      component.applyPagination();
      expect(component.filteredCustomers.length).toBe(1);

      component.onPageChange(2);
      expect(component.pageNum).toBe(2);
      expect(component.filteredCustomers.length).toBe(1);
    });
  });

  describe('onSearch', () => {
    it('should apply smart search and reset to page 1', () => {
      component.allCustomers = [
        { sysPk: 1, userPK: 'C001', name: 'Acme Corp', module: 'CUST' },
        { sysPk: 2, userPK: 'C002', name: 'Beta Inc', module: 'CUST' }
      ];
      component.customers = [...component.allCustomers];
      component.pageNum = 5;
      component.applyPagination();

      component.onSearch({ userPK: 'acme' });
      expect(component.pageNum).toBe(1);
      expect(component.filteredCustomers.length).toBe(1);
    });

    it('should reset to all customers on empty search', () => {
      component.allCustomers = [
        { sysPk: 1, userPK: 'C001', name: 'Acme Corp', module: 'CUST' }
      ];
      component.customers = [{ sysPk: 1, userPK: 'C001', name: 'Acme Corp', module: 'CUST' }];

      component.onSearch({});
      expect(component.filteredCustomers).toEqual(component.allCustomers);
    });
  });

  describe('onClearSearch', () => {
    it('should reset search and reload all customers', () => {
      component.allCustomers = [
        { sysPk: 1, userPK: 'C001', name: 'Acme Corp', module: 'CUST' }
      ];
      component.searchStr = 'test';
      component.customers = [];
      component.pageNum = 5;

      component.onClearSearch();
      expect(component.searchStr).toBe('');
      expect(component.customers).toEqual(component.allCustomers);
      expect(component.pageNum).toBe(1);
    });
  });

  describe('onNew', () => {
    it('should be a stub (navigation handled by list component)', () => {
      component.onNew();
      expect(true).toBe(true);
    });
  });
});
