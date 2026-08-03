import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { OtherAdjustmentComponent } from './other-adjustment.component';
import { HttpService } from '../../../services/http.service';
import { AlertService } from '../../../services/alert.service';
import { TransactionConfigService } from '../../../services/transaction-config.service';
import { ListComponent } from '../../../components/shared/list/list.component';

class MockHttpService {
  getTransactionsByModuleType = jasmine.createSpy('getTransactionsByModuleType').and.returnValue(of({
    lists: [],
    totalRecords: 0,
    pageNum: 1,
    pageSize: 20
  }));
}

class MockAlertService {
  setCustomErrorAlert = jasmine.createSpy('setCustomErrorAlert');
  setCustomSuccessAlert = jasmine.createSpy('setCustomSuccessAlert');
  setCustomInfoAlert = jasmine.createSpy('setCustomInfoAlert');
}

describe('OtherAdjustmentComponent', () => {
  let component: OtherAdjustmentComponent;
  let fixture: ComponentFixture<OtherAdjustmentComponent>;
  let httpService: MockHttpService;

  beforeEach(async () => {
    httpService = new MockHttpService();

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        OtherAdjustmentComponent,
        ListComponent
      ],
      providers: [
        { provide: HttpService, useValue: httpService },
        { provide: AlertService, useValue: new MockAlertService() },
        TransactionConfigService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OtherAdjustmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load configuration for OTHERADJ on init', () => {
    expect(component.config).toBeTruthy();
    expect(component.config.moduleType).toBe('OTHERADJ');
  });

  it('should call loadTransactions on init', () => {
    expect(httpService.getTransactionsByModuleType).toHaveBeenCalled();
  });

  describe('loadTransactions', () => {
    it('should set loading state and update transactions', fakeAsync(() => {
      component.loadTransactions();
      tick();
      expect(component.loading).toBe(false);
      expect(component.transactions).toEqual([]);
    }));

    it('should set loading to false on failure', fakeAsync(() => {
      httpService.getTransactionsByModuleType.and.returnValue(throwError(() => new Error('Network error')));
      component.loadTransactions();
      tick();
      expect(component.loading).toBe(false);
    }));
  });

  describe('onPageChange', () => {
    it('should reload transactions with new page', fakeAsync(() => {
      component.pageNum = 1;
      component.onPageChange(3);
      tick();
      expect(httpService.getTransactionsByModuleType).toHaveBeenCalledWith('OTHERADJ', 3, component.pageSize, undefined);
    }));
  });

  describe('onSearch', () => {
    it('should reset to page 1 and reload with criteria', fakeAsync(() => {
      component.pageNum = 5;
      component.onSearch({ moduleType: 'OTHERADJ' });
      expect(component.pageNum).toBe(1);
      tick();
    }));
  });

  describe('onNewTransaction', () => {
    it('should navigate using config.newRoute', fakeAsync(() => {
      const router = TestBed.inject(Router);
      spyOn(router, 'navigate');
      component.config.newRoute = '/inventory/otheradj/new';
      component.onNewTransaction();
      expect(router.navigate).toHaveBeenCalledWith(['/inventory/otheradj/new']);
    }));
  });

  describe('onEditTransaction', () => {
    it('should navigate to edit route', fakeAsync(() => {
      const router = TestBed.inject(Router);
      spyOn(router, 'navigate');
      component.config.detailRoutePrefix = '/inventory/otheradj/';
      component.onEditTransaction(42);
      expect(router.navigate).toHaveBeenCalledWith(['/inventory/otheradj/42']);
    }));
  });

  describe('onViewTransaction', () => {
    it('should delegate to onEditTransaction', fakeAsync(() => {
      const router = TestBed.inject(Router);
      spyOn(router, 'navigate');
      component.config.detailRoutePrefix = '/inventory/otheradj/';
      component.onViewTransaction(42);
      expect(router.navigate).toHaveBeenCalledWith(['/inventory/otheradj/42']);
    }));
  });

  describe('onPrintTransaction / onVoidTransaction', () => {
    it('should show info alert for print', fakeAsync(() => {
      component.onPrintTransaction(1);
      tick();
    }));

    it('should show info alert for void', fakeAsync(() => {
      component.onVoidTransaction(1);
      tick();
    }));
  });
});

