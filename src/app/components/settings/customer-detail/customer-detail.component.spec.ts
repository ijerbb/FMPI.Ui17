import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject } from 'rxjs';
import { CustomerDetailComponent } from './customer-detail.component';
import { CustomerService } from '../../../services/customer.service';
import { AlertService } from '../../../services/alert.service';

class MockCustomerService {
  getCustomerById = jasmine.createSpy('getCustomerById').and.returnValue(of({
    sysPk: 1, userPK: 'C001', name: 'Customer 1', module: 'CUST'
  }));
  saveCustomer = jasmine.createSpy('saveCustomer').and.returnValue(of({ success: true, data: '1', rawData: '' }));
  deleteCustomer = jasmine.createSpy('deleteCustomer').and.returnValue(of({ success: true, data: '', rawData: '' }));
}

class MockRouter {
  navigate = jasmine.createSpy('navigate');
  navigateByUrl = jasmine.createSpy('navigateByUrl');
  url = '/settings/customer/1';
  events = new Subject<any>();
  parseUrl = jasmine.createSpy('parseUrl').and.returnValue({});
  serializeUrl = jasmine.createSpy('serializeUrl').and.returnValue('/settings/customer');
  createUrlTree = jasmine.createSpy('createUrlTree').and.returnValue({});
}

class MockAlertService {
  setCustomErrorAlert = jasmine.createSpy('setCustomErrorAlert');
  setCustomSuccessAlert = jasmine.createSpy('setCustomSuccessAlert');
}

function createCustomerDetailTestBed(idParam: string) {
  return TestBed.configureTestingModule({
    imports: [
      HttpClientTestingModule,
      RouterModule.forRoot([]),
      CustomerDetailComponent
    ],
    providers: [
      { provide: CustomerService, useValue: new MockCustomerService() },
      { provide: Router, useValue: new MockRouter() },
      { provide: AlertService, useValue: new MockAlertService() },
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: {
            paramMap: { get: (key: string) => key === 'id' ? idParam : null },
            params: idParam === 'new' ? {} : { id: idParam },
            url: idParam === 'new' ? [{ path: 'new' }] : []
          },
          paramMap: of({ get: (key: string) => key === 'id' ? idParam : null }),
          params: of(idParam === 'new' ? {} : { id: idParam }),
          url: of(idParam === 'new' ? [{ path: 'new' }] : [])
        }
      }
    ]
  });
}

describe('CustomerDetailComponent', () => {
  let component: CustomerDetailComponent;
  let fixture: ComponentFixture<CustomerDetailComponent>;
  let customerService: MockCustomerService;
  let mockRouter: MockRouter;

  beforeEach(async () => {
    customerService = new MockCustomerService();
    mockRouter = new MockRouter();

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        CustomerDetailComponent
      ],
      providers: [
        { provide: CustomerService, useValue: customerService },
        { provide: Router, useValue: mockRouter },
        { provide: AlertService, useValue: new MockAlertService() },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: { get: (key: string) => key === 'id' ? '1' : null },
              params: { id: '1' },
              url: []
            },
            paramMap: of({ get: (key: string) => key === 'id' ? '1' : null }),
            params: of({ id: '1' }),
            url: of([])
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    if (component.ngOnDestroy) {
      try { component.ngOnDestroy(); } catch (e) {}
    }
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default customer state', () => {
    expect(component.customer.module).toBe('CUST');
    expect(component.isEditMode).toBe(false);
    expect(component.loading).toBe(false);
    expect(component.activeTab).toBe('moreInfo');
  });

  describe('loadFromRoute with numeric ID', () => {
    it('should set sysPk and load customer for numeric ID', fakeAsync(() => {
      expect(component.sysPk).toBe(1);
      expect(component.isEditMode).toBe(false);
      expect(customerService.getCustomerById).toHaveBeenCalledWith(1);
      tick();
      expect(component.loading).toBe(false);
    }));
  });

  describe('loadFromRoute for new route', () => {
    it('should start in edit mode', fakeAsync(() => {
      TestBed.resetTestingModule();
      const newService = new MockCustomerService();
      const newRouter = new MockRouter();
      const newAlertService = new MockAlertService();

      TestBed.configureTestingModule({
        imports: [
          HttpClientTestingModule,
          RouterModule.forRoot([]),
          CustomerDetailComponent
        ],
        providers: [
          { provide: CustomerService, useValue: newService },
          { provide: Router, useValue: newRouter },
          { provide: AlertService, useValue: newAlertService },
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: {
                paramMap: { get: (key: string) => key === 'id' ? 'new' : null },
                params: {},
                url: [{ path: 'new' }]
              },
              paramMap: of({ get: (key: string) => key === 'id' ? 'new' : null }),
              params: of({}),
              url: of([{ path: 'new' }])
            }
          }
        ]
      }).compileComponents();

      const newFixture = TestBed.createComponent(CustomerDetailComponent);
      const newComponent = newFixture.componentInstance;
      newFixture.detectChanges();
      tick();
      expect(newComponent.isEditMode).toBe(true);
      expect(newComponent.sysPk).toBeNull();
    }));
  });

  describe('loadFromRoute for invalid ID', () => {
    it('should show error and redirect for invalid ID', fakeAsync(() => {
      TestBed.resetTestingModule();
      const invalidService = new MockCustomerService();
      const invalidRouter = new MockRouter();
      const invalidAlertService = new MockAlertService();

      TestBed.configureTestingModule({
        imports: [
          HttpClientTestingModule,
          RouterModule.forRoot([]),
          CustomerDetailComponent
        ],
        providers: [
          { provide: CustomerService, useValue: invalidService },
          { provide: Router, useValue: invalidRouter },
          { provide: AlertService, useValue: invalidAlertService },
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: {
                paramMap: { get: (key: string) => 'invalid' },
                params: { id: 'invalid' },
                url: []
              },
              paramMap: of({ get: (key: string) => 'invalid' }),
              params: of({ id: 'invalid' }),
              url: of([])
            }
          }
        ]
      }).compileComponents();

      const invalidFixture = TestBed.createComponent(CustomerDetailComponent);
      const invalidComponent = invalidFixture.componentInstance;
      invalidFixture.detectChanges();
      tick();
      expect(invalidAlertService.setCustomErrorAlert).toHaveBeenCalled();
      expect(invalidRouter.navigate).toHaveBeenCalledWith(['/settings/customer']);
    }));
  });

  describe('onEdit', () => {
    it('should toggle to edit mode', () => {
      component.isEditMode = false;
      component.onEdit();
      expect(component.isEditMode).toBe(true);
    });

    it('should toggle back to view mode and reload when canceling', fakeAsync(() => {
      component.isEditMode = true;
      customerService.getCustomerById.and.returnValue(of({
        sysPk: 1, userPK: 'C001', name: 'Customer 1', module: 'CUST'
      }));
      component.onEdit();
      expect(component.isEditMode).toBe(false);
      expect(customerService.getCustomerById).toHaveBeenCalledWith(1);
      tick();
    }));
  });

  describe('onAdd', () => {
    it('should navigate to new customer route', () => {
      component.onAdd();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/settings/customer/new']);
    });
  });

  describe('save', () => {
    it('should show error when userPK is missing', () => {
      component.customer.userPK = '';
      component.customer.name = 'Test Customer';
      component.save();
      expect(customerService.saveCustomer).not.toHaveBeenCalled();
    });

    it('should show error when name is missing', () => {
      component.customer.userPK = 'C001';
      component.customer.name = '';
      component.save();
      expect(customerService.saveCustomer).not.toHaveBeenCalled();
    });

    it('should save customer and navigate back on success', fakeAsync(() => {
      component.customer.userPK = 'C001';
      component.customer.name = 'Test Customer';
      customerService.saveCustomer.and.returnValue(of({ success: true, data: '1', rawData: '' }));
      component.save();
      tick();

      expect(customerService.saveCustomer).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/settings/customer']);
    }));

    it('should show error on save failure', fakeAsync(() => {
      component.customer.userPK = 'C001';
      component.customer.name = 'Test Customer';
      customerService.saveCustomer.and.returnValue(of({ success: false, data: 'Save failed', rawData: '' }));
      component.save();
      tick();

      expect(customerService.saveCustomer).toHaveBeenCalled();
    }));
  });

  describe('delete', () => {
    it('should not delete when sysPk is null', () => {
      component.sysPk = null;
      spyOn(window, 'confirm').and.returnValue(true);
      component.delete();
      expect(customerService.deleteCustomer).not.toHaveBeenCalled();
    });

    it('should not delete when user cancels', fakeAsync(() => {
      component.sysPk = 1;
      spyOn(window, 'confirm').and.returnValue(false);
      component.delete();
      tick();
      expect(customerService.deleteCustomer).not.toHaveBeenCalled();
    }));

    it('should delete and navigate back on success', fakeAsync(() => {
      component.sysPk = 1;
      spyOn(window, 'confirm').and.returnValue(true);
      customerService.deleteCustomer.and.returnValue(of({ success: true, data: '', rawData: '' }));
      component.delete();
      tick();
      expect(customerService.deleteCustomer).toHaveBeenCalledWith(1);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/settings/customer']);
    }));
  });

  describe('goBack', () => {
    it('should navigate to customer list', () => {
      component.goBack();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/settings/customer']);
    });
  });

  describe('tab switching', () => {
    it('should switch to moreInfo tab', () => {
      component.activeTab = 'systemInfo';
      component.switchToMoreInfoTab();
      expect(component.activeTab).toBe('moreInfo');
    });

    it('should switch to systemInfo tab', () => {
      component.activeTab = 'moreInfo';
      component.switchToSystemInfoTab();
      expect(component.activeTab).toBe('systemInfo');
    });
  });
});
