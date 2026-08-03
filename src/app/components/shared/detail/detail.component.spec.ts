import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { of, Subject } from 'rxjs';
import { DetailComponent } from './detail.component';
import { HttpService } from '../../../services/http.service';
import { AlertService } from '../../../services/alert.service';
import { TransactionConfigService } from '../../../services/transaction-config.service';

class MockHttpService {
  getTransactionById = jasmine.createSpy('getTransactionById').and.returnValue(of({
    success: true,
    data: JSON.stringify({ sysPK: 1, userPK: 'T001', moduleType: 'OTHERADJ' }),
    rawData: ''
  }));
  createTransaction = jasmine.createSpy('createTransaction').and.returnValue(of({
    success: true, data: '1', rawData: ''
  }));
  updateTransaction = jasmine.createSpy('updateTransaction').and.returnValue(of({
    success: true, data: '1', rawData: ''
  }));
  voidTransaction = jasmine.createSpy('voidTransaction').and.returnValue(of({
    success: true, data: '', rawData: ''
  }));
}

class MockAlertService {
  setCustomSuccessAlert = jasmine.createSpy('setCustomSuccessAlert');
  setCustomErrorAlert = jasmine.createSpy('setCustomErrorAlert');
}

class MockRouter {
  navigate = jasmine.createSpy('navigate');
  navigateByUrl = jasmine.createSpy('navigateByUrl');
  events = new Subject<any>();
  parseUrl = jasmine.createSpy('parseUrl').and.returnValue({});
  serializeUrl = jasmine.createSpy('serializeUrl').and.returnValue('/');
  createUrlTree = jasmine.createSpy('createUrlTree').and.returnValue({});
}

describe('DetailComponent', () => {
  let component: DetailComponent;
  let fixture: ComponentFixture<DetailComponent>;
  let httpService: MockHttpService;
  let mockRouter: MockRouter;

  beforeEach(async () => {
    httpService = new MockHttpService();
    mockRouter = new MockRouter();

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterModule.forRoot([]),
        DetailComponent
      ],
      providers: [
        { provide: HttpService, useValue: httpService },
        { provide: AlertService, useValue: new MockAlertService() },
        { provide: Router, useValue: mockRouter },
        TransactionConfigService,
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ moduleType: 'OTHERADJ', id: '1' })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load configuration from route moduleType', () => {
    expect(component.config).toBeTruthy();
    expect(component.moduleType).toBe('OTHERADJ');
  });

  it('should load transaction for numeric ID', fakeAsync(() => {
    expect(component.sysPK).toBe(1);
    expect(component.isEditMode).toBe(false);
    expect(httpService.getTransactionById).toHaveBeenCalledWith(1);
    tick();
    expect(component.loading).toBe(false);
  }));

  it('should start in edit mode for new route', fakeAsync(() => {
    TestBed.resetTestingModule();
    const newHttpService = new MockHttpService();
    const newMockRouter = new MockRouter();

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterModule.forRoot([]),
        DetailComponent
      ],
      providers: [
        { provide: HttpService, useValue: newHttpService },
        { provide: AlertService, useValue: {} },
        { provide: Router, useValue: newMockRouter },
        TransactionConfigService,
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ moduleType: 'OTHERADJ', id: 'new' })
          }
        }
      ]
    });

    const newFixture = TestBed.createComponent(DetailComponent);
    const newComponent = newFixture.componentInstance;
    newFixture.detectChanges();
    tick();

    expect(newComponent.isEditMode).toBe(true);
    expect(newComponent.sysPK).toBeNull();
    expect(newComponent.transaction.moduleType).toBe('OTHERADJ');
  }));

  describe('save', () => {
    it('should show error when dateIssue is missing', () => {
      component.transaction.dateIssue = undefined;
      component.transaction.totalAmount = 100;
      component.save();
      expect(httpService.createTransaction).not.toHaveBeenCalled();
      expect(httpService.updateTransaction).not.toHaveBeenCalled();
    });

    it('should show error when totalAmount is missing', () => {
      component.transaction.dateIssue = '2024-01-01';
      component.transaction.totalAmount = undefined;
      component.save();
      expect(httpService.createTransaction).not.toHaveBeenCalled();
    });

    it('should call createTransaction when no sysPK', fakeAsync(() => {
      component.sysPK = null;
      component.transaction.dateIssue = '2024-01-01';
      component.transaction.totalAmount = 100;
      httpService.createTransaction.and.returnValue(of({ success: true, data: '1', rawData: '' }));
      component.save();
      tick();
      expect(httpService.createTransaction).toHaveBeenCalled();
    }));

    it('should call updateTransaction when sysPK exists', fakeAsync(() => {
      component.sysPK = 42;
      component.transaction.dateIssue = '2024-01-01';
      component.transaction.totalAmount = 100;
      httpService.updateTransaction.and.returnValue(of({ success: true, data: '1', rawData: '' }));
      component.save();
      tick();
      expect(httpService.updateTransaction).toHaveBeenCalled();
    }));
  });

  describe('delete', () => {
    it('should not delete when no sysPK', () => {
      component.sysPK = null;
      spyOn(window, 'confirm').and.returnValue(true);
      component.delete();
      expect(httpService.voidTransaction).not.toHaveBeenCalled();
    });

    it('should not delete when user cancels', fakeAsync(() => {
      component.sysPK = 1;
      spyOn(window, 'confirm').and.returnValue(false);
      component.delete();
      tick();
      expect(httpService.voidTransaction).not.toHaveBeenCalled();
    }));
  });

  describe('goBack', () => {
    it('should navigate to config detail route prefix', () => {
      component.goBack();
      expect(mockRouter.navigate).toHaveBeenCalled();
    });
  });
});
