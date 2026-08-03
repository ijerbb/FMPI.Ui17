import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { of } from 'rxjs';

import { SupplierComponent } from './supplier.component';
import { SupplierService } from '../../../services/supplier.service';
import { AlertService } from '../../../services/alert.service';
import { TransactionConfigService } from '../../../services/transaction-config.service';
import { UniversalMasterDto } from '../../../models/dto/universalMasterDto';
import { ListComponent } from '../../../components/shared/list/list.component';
import { PaginationComponent } from '../../../components/shared/pagination/pagination.component';

class MockSupplierService {
  getAllSuppliers = jasmine.createSpy('getAllSuppliers').and.returnValue(of([]));
  deleteMultipleSuppliers = jasmine.createSpy('deleteMultipleSuppliers').and.returnValue(of({ success: true, data: '', rawData: '' }));
}

class MockAlertService {
  setCustomErrorAlert = jasmine.createSpy('setCustomErrorAlert');
  setCustomSuccessAlert = jasmine.createSpy('setCustomSuccessAlert');
}

describe('SupplierComponent', () => {
  let component: SupplierComponent;
  let fixture: ComponentFixture<SupplierComponent>;
  let supplierService: MockSupplierService;

  beforeEach(async () => {
    supplierService = new MockSupplierService();

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterModule.forRoot([]),
        SupplierComponent,
        ListComponent,
        PaginationComponent
      ],
      providers: [
        { provide: SupplierService, useValue: supplierService },
        { provide: AlertService, useValue: new MockAlertService() },
        TransactionConfigService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SupplierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load configuration for SUPL module on init', () => {
    expect(component.config).toBeTruthy();
    expect(component.config.moduleType).toBe('SUPL');
  });

  it('should call getAllSuppliers on init', () => {
    expect(supplierService.getAllSuppliers).toHaveBeenCalled();
  });

  it('should initialize with empty suppliers', () => {
    expect(component.allSuppliers).toEqual([]);
    expect(component.suppliers).toEqual([]);
    expect(component.filteredSuppliers).toEqual([]);
  });

  describe('applyPagination', () => {
    it('should slice suppliers correctly', () => {
      component.allSuppliers = [
        { sysPk: 1, userPK: 'S001', name: 'Supplier 1', module: 'SUPL' },
        { sysPk: 2, userPK: 'S002', name: 'Supplier 2', module: 'SUPL' }
      ];
      component.suppliers = [...component.allSuppliers];
      component.pageNum = 1;
      component.pageSize = 1;
      component.applyPagination();
      expect(component.filteredSuppliers.length).toBe(1);
      expect(component.totalRecords).toBe(2);
    });
  });

  describe('applySmartSearch', () => {
    it('should return all suppliers when search term is empty', () => {
      component.allSuppliers = [
        { sysPk: 1, userPK: 'S001', name: 'Acme Supply', module: 'SUPL' }
      ];
      const results = component.applySmartSearch('');
      expect(results).toEqual(component.allSuppliers);
    });

    it('should filter suppliers matching search term', () => {
      component.allSuppliers = [
        { sysPk: 1, userPK: 'S001', name: 'Acme Supply', module: 'SUPL' },
        { sysPk: 2, userPK: 'S002', name: 'Beta Corp', module: 'SUPL' }
      ];
      const results = component.applySmartSearch('acme');
      expect(results.length).toBe(1);
    });

    it('should search across all fields including module', () => {
      component.allSuppliers = [
        { sysPk: 1, userPK: 'S001', name: 'Acme', module: 'SUPL' }
      ];
      const results = component.applySmartSearch('SUPL');
      expect(results.length).toBe(1);
    });
  });

  describe('handleBulkDelete', () => {
    it('should call deleteMultipleSuppliers when confirmed', fakeAsync(() => {
      spyOn(window, 'confirm').and.returnValue(true);
      supplierService.deleteMultipleSuppliers.and.returnValue(of({ success: true, data: '', rawData: '' }));
      component.handleBulkDelete([1, 2]);
      tick();
      expect(supplierService.deleteMultipleSuppliers).toHaveBeenCalledWith([1, 2]);
    }));

    it('should skip delete when ids array is empty', fakeAsync(() => {
      component.handleBulkDelete([]);
      tick();
      expect(supplierService.deleteMultipleSuppliers).not.toHaveBeenCalled();
    }));
  });

  describe('onPageChange', () => {
    it('should update pageNum and re-apply pagination', () => {
      component.suppliers = [
        { sysPk: 1, userPK: 'S001', name: 'Supplier 1', module: 'SUPL' }
      ];
      component.pageNum = 1;
      component.onPageChange(2);
      expect(component.pageNum).toBe(2);
    });
  });
});
