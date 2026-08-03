import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { InventoryStockTakeDetailComponent } from './inventory-stock-take-detail.component';
import { HttpService } from '../../../services/http.service';
import { AlertService } from '../../../services/alert.service';
import { CryptoService } from '../../../services/crypto.service';
import { DomSanitizer } from '@angular/platform-browser';
import { StockTakeSessionDto } from '../../../models/dto/stockTakeSessionDto';
import { ResponseListDto } from '../../../models/dto/responseListDto';

class MockHttpService {
  listStockTakeSessions = jasmine.createSpy('listStockTakeSessions').and.returnValue(of(new ResponseListDto()));
  getUserId = jasmine.createSpy('getUserId').and.returnValue(of({ success: true, data: '1', rawData: '' }));
  verifyAccessRights = jasmine.createSpy('verifyAccessRights').and.returnValue(of({ success: true, data: '', rawData: '' }));
  getUser = jasmine.createSpy('getUser').and.returnValue(of({ code: '', data: '', success: false }));
  countTasksBySession = jasmine.createSpy('countTasksBySession').and.returnValue(of({ success: true, data: '{}', rawData: '' }));
  getTaskValuesBySession = jasmine.createSpy('getTaskValuesBySession').and.returnValue(of({ success: true, data: '{}', rawData: '' }));
  getTasksBySessionAndStatus = jasmine.createSpy('getTasksBySessionAndStatus').and.returnValue(of(new ResponseListDto()));
  getTasksBySession = jasmine.createSpy('getTasksBySession').and.returnValue(of(new ResponseListDto()));
  isBarcodeExist = jasmine.createSpy('isBarcodeExist').and.returnValue(of({ success: false, data: '', rawData: '' }));
  getTaskBySessionAndProductAndUserId = jasmine.createSpy('getTaskBySessionAndProductAndUserId').and.returnValue(of({}));
  getProductByBarcode = jasmine.createSpy('getProductByBarcode').and.returnValue(of({ lists: [] }));
  recordStockCountEntry = jasmine.createSpy('recordStockCountEntry').and.returnValue(of({ success: true, data: '', rawData: '' }));
  createStockTakeTask = jasmine.createSpy('createStockTakeTask').and.returnValue(of({}));
  updateStockTakeSession = jasmine.createSpy('updateStockTakeSession').and.returnValue(of({ success: true, data: '', rawData: '' }));
  createStockTakeSession = jasmine.createSpy('createStockTakeSession').and.returnValue(of({ success: true, data: '', rawData: '' }));
  syncActualInventory = jasmine.createSpy('syncActualInventory').and.returnValue(of({ success: true, data: '', rawData: '' }));
  batchCreateMissingAdjustments = jasmine.createSpy('batchCreateMissingAdjustments').and.returnValue(of({ success: true, data: '', rawData: '' }));
  getTransactionHistoryByProductId = jasmine.createSpy('getTransactionHistoryByProductId').and.returnValue(of([]));
  updateStockTakeTask = jasmine.createSpy('updateStockTakeTask').and.returnValue(of({ success: true, data: '', rawData: '' }));
  getProduct = jasmine.createSpy('getProduct').and.returnValue(of({ lists: [] }));
}

import { Subject } from 'rxjs';

class MockRouter {
  navigate = jasmine.createSpy('navigate');
  navigateByUrl = jasmine.createSpy('navigateByUrl');
  events = new Subject<any>();
  parseUrl = jasmine.createSpy('parseUrl').and.returnValue({});
  serializeUrl = jasmine.createSpy('serializeUrl').and.returnValue('/');
  createUrlTree = jasmine.createSpy('createUrlTree').and.returnValue({});
}

class MockAlertService {
  setCustomErrorAlert = jasmine.createSpy('setCustomErrorAlert');
  setCustomSuccessAlert = jasmine.createSpy('setCustomSuccessAlert');
}

class MockCryptoService {
  encryptToBase64 = jasmine.createSpy('encryptToBase64').and.returnValue('encrypted');
}

class MockDomSanitizer {
  bypassSecurityTrustResourceUrl(url: string) { return url; }
}

describe('InventoryStockTakeDetailComponent', () => {
  let component: InventoryStockTakeDetailComponent;
  let fixture: ComponentFixture<InventoryStockTakeDetailComponent>;
  let httpService: MockHttpService;

  beforeEach(async () => {
    httpService = new MockHttpService();

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterModule.forRoot([]),
        InventoryStockTakeDetailComponent
      ],
      providers: [
        { provide: HttpService, useValue: httpService },
        { provide: AlertService, useValue: new MockAlertService() },
        { provide: CryptoService, useValue: new MockCryptoService() },
        { provide: DomSanitizer, useValue: new MockDomSanitizer() },
        { provide: Router, useValue: new MockRouter() },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: { get: (key: string) => key === 'id' ? '1' : null },
              params: { id: '1' },
              url: []
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryStockTakeDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load session for numeric ID', fakeAsync(() => {
    expect(httpService.listStockTakeSessions).toHaveBeenCalled();
    tick();
  }));

  it('should start with new session for new route', fakeAsync(() => {
    TestBed.resetTestingModule();
    const newHttpService = new MockHttpService();
    const newMockAlertService = new MockAlertService();
    const newMockCryptoService = new MockCryptoService();
    const newMockRouter = new MockRouter();

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterModule.forRoot([]),
        InventoryStockTakeDetailComponent
      ],
      providers: [
        { provide: HttpService, useValue: newHttpService },
        { provide: AlertService, useValue: newMockAlertService },
        { provide: CryptoService, useValue: newMockCryptoService },
        { provide: DomSanitizer, useValue: new MockDomSanitizer() },
        { provide: Router, useValue: newMockRouter },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: { get: (key: string) => 'new' },
              params: {},
              url: [{ path: 'new' }]
            }
          }
        }
      ]
    });

    const newFixture = TestBed.createComponent(InventoryStockTakeDetailComponent);
    const newComponent = newFixture.componentInstance;
    newFixture.detectChanges();
    tick();
    expect(newComponent.session).toBeTruthy();
  }));

  describe('canConfirmCount', () => {
    it('should return canConfirm false when no entries', () => {
      const result = component.canConfirmCount({} as any);
      expect(result.canConfirm).toBe(false);
    });

    it('should return canConfirm true when multiple matching counts', () => {
      const task = {
        stockCountEntries: [
          { counterId: 1, countedQty: 10 },
          { counterId: 2, countedQty: 10 }
        ]
      } as any;
      const result = component.canConfirmCount(task);
      expect(result.canConfirm).toBe(true);
    });
  });

  describe('isSessionInReview', () => {
    it('should return true when session status is 3', () => {
      component.session = { status: 3 } as any;
      component.loadedSessionStatus = 3;
      expect(component.isSessionInReview()).toBe(true);
    });

    it('should return false when session status is not 3', () => {
      component.session = { status: 1 } as any;
      component.loadedSessionStatus = 1;
      expect(component.isSessionInReview()).toBe(false);
    });
  });

  describe('cancel', () => {
    it('should navigate to stock take list', fakeAsync(() => {
      component.cancel();
    }));
  });

  describe('toggleReviewAccordion', () => {
    it('should toggle accordion state', () => {
      component.showReviewAccordion = false;
      component.toggleReviewAccordion();
      expect(component.showReviewAccordion).toBe(true);
      component.toggleReviewAccordion();
      expect(component.showReviewAccordion).toBe(false);
    });
  });

  describe('toggleTaskReview', () => {
    it('should expand and collapse task', () => {
      component.toggleTaskReview(1);
      expect(component.expandedTaskId).toBe(1);
      component.toggleTaskReview(1);
      expect(component.expandedTaskId).toBeNull();
    });
  });

  describe('getCounterName', () => {
    it('should return User {id} fallback', () => {
      component.tasksRes.lists = [];
      const result = component.getCounterName(5);
      expect(result).toBe('User 5');
    });
  });

  describe('totalCounted', () => {
    it('should return total counted quantity', () => {
      component.foundTask = {
        stockCountEntries: [
          { countedQty: 5 },
          { countedQty: 3 }
        ]
      } as any;
      component.countedQty = 2;
      expect(component.totalCounted()).toBe(10);
    });
  });
});
