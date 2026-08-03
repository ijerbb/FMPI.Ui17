import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { of } from 'rxjs';

import { PayeeComponent } from './payee.component';
import { PayeeService } from '../../../services/payee.service';
import { AlertService } from '../../../services/alert.service';
import { TransactionConfigService } from '../../../services/transaction-config.service';
import { UniversalMasterDto } from '../../../models/dto/universalMasterDto';
import { ListComponent } from '../../../components/shared/list/list.component';
import { PaginationComponent } from '../../../components/shared/pagination/pagination.component';

class MockPayeeService {
  getAllPayees = jasmine.createSpy('getAllPayees').and.returnValue(of([]));
  deleteMultiplePayees = jasmine.createSpy('deleteMultiplePayees').and.returnValue(of({ success: true, data: '', rawData: '' }));
}

class MockAlertService {
  setCustomErrorAlert = jasmine.createSpy('setCustomErrorAlert');
  setCustomSuccessAlert = jasmine.createSpy('setCustomSuccessAlert');
  setCustomInfoAlert = jasmine.createSpy('setCustomInfoAlert');
}

describe('PayeeComponent', () => {
  let component: PayeeComponent;
  let fixture: ComponentFixture<PayeeComponent>;
  let payeeService: MockPayeeService;
  let alertService: MockAlertService;

  beforeEach(async () => {
    payeeService = new MockPayeeService();
    alertService = new MockAlertService();

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterModule.forRoot([]),
        PayeeComponent,
        ListComponent,
        PaginationComponent
      ],
      providers: [
        { provide: PayeeService, useValue: payeeService },
        { provide: AlertService, useValue: alertService },
        TransactionConfigService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PayeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load configuration for SUPLNT module on init', () => {
    expect(component.config).toBeTruthy();
    expect(component.config.moduleType).toBe('SUPLNT');
  });

  it('should call getAllPayees on init', () => {
    expect(payeeService.getAllPayees).toHaveBeenCalled();
  });

  it('should initialize with empty payees', () => {
    expect(component.allPayees).toEqual([]);
    expect(component.payees).toEqual([]);
    expect(component.filteredPayees).toEqual([]);
  });

  describe('applySmartSearch', () => {
    it('should return all payees when search term is empty', () => {
      component.allPayees = [
        { sysPk: 1, userPK: 'P001', name: 'Payee 1', module: 'SUPLNT' }
      ];
      const results = component.applySmartSearch('');
      expect(results).toEqual(component.allPayees);
    });

    it('should filter payees matching search term', () => {
      component.allPayees = [
        { sysPk: 1, userPK: 'P001', name: 'Acme Payee', module: 'SUPLNT' },
        { sysPk: 2, userPK: 'P002', name: 'Beta Payee', module: 'SUPLNT' }
      ];
      const results = component.applySmartSearch('acme');
      expect(results.length).toBe(1);
    });

    it('should use AND logic for multi-word search', () => {
      component.allPayees = [
        { sysPk: 1, userPK: 'P001', name: 'Acme Corp Payee', module: 'SUPLNT' }
      ];
      const results = component.applySmartSearch('acme corp');
      expect(results.length).toBe(1);
    });
  });

  describe('handleBulkDelete', () => {
    it('should call deleteMultiplePayees when confirmed', fakeAsync(() => {
      spyOn(window, 'confirm').and.returnValue(true);
      payeeService.deleteMultiplePayees.and.returnValue(of({ success: true, data: '', rawData: '' }));
      component.handleBulkDelete([1, 2]);
      tick();
      expect(payeeService.deleteMultiplePayees).toHaveBeenCalledWith([1, 2]);
    }));

    it('should skip delete when ids array is empty', fakeAsync(() => {
      component.handleBulkDelete([]);
      tick();
      expect(payeeService.deleteMultiplePayees).not.toHaveBeenCalled();
    }));
  });

  describe('onPageChange', () => {
    it('should update pageNum', () => {
      component.payees = [
        { sysPk: 1, userPK: 'P001', name: 'Payee 1', module: 'SUPLNT' }
      ];
      component.pageNum = 1;
      component.onPageChange(3);
      expect(component.pageNum).toBe(3);
    });
  });
});
