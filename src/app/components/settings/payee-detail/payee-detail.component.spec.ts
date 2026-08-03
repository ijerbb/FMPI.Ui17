import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject } from 'rxjs';
import { PayeeDetailComponent } from './payee-detail.component';
import { PayeeService } from '../../../services/payee.service';
import { AlertService } from '../../../services/alert.service';

class MockPayeeService {
  getPayeeById = jasmine.createSpy('getPayeeById').and.returnValue(of({
    sysPk: 1, userPK: 'P001', name: 'Payee 1', module: 'SUPLNT'
  }));
  savePayee = jasmine.createSpy('savePayee').and.returnValue(of({ success: true, data: '1', rawData: '' }));
  deletePayee = jasmine.createSpy('deletePayee').and.returnValue(of({ success: true, data: '', rawData: '' }));
}

class MockAlertService {
  setCustomErrorAlert = jasmine.createSpy('setCustomErrorAlert');
  setCustomSuccessAlert = jasmine.createSpy('setCustomSuccessAlert');
}

class MockRouter {
  navigate = jasmine.createSpy('navigate');
  navigateByUrl = jasmine.createSpy('navigateByUrl');
  url = '/settings/payee/1';
  events = new Subject<any>();
  parseUrl = jasmine.createSpy('parseUrl').and.returnValue({});
  serializeUrl = jasmine.createSpy('serializeUrl').and.returnValue('/settings/payee');
  createUrlTree = jasmine.createSpy('createUrlTree').and.returnValue({});
}

describe('PayeeDetailComponent', () => {
  let component: PayeeDetailComponent;
  let fixture: ComponentFixture<PayeeDetailComponent>;
  let payeeService: MockPayeeService;

  beforeEach(async () => {
    payeeService = new MockPayeeService();

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        PayeeDetailComponent
      ],
      providers: [
        { provide: PayeeService, useValue: payeeService },
        { provide: Router, useValue: new MockRouter() },
        { provide: AlertService, useValue: new MockAlertService() },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: { get: (key: string) => key === 'id' ? '1' : null },
              params: { id: '1' },
              url: []
            },
            paramMap: of({ get: (key: string) => key === 'id' ? '1' : null })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PayeeDetailComponent);
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

  it('should initialize with payee module SUPLNT', () => {
    expect(component.payee.module).toBe('SUPLNT');
  });

  describe('save', () => {
    it('should show error when userPK is missing', () => {
      component.payee.userPK = '';
      component.payee.name = 'Test';
      component.save();
      expect(payeeService.savePayee).not.toHaveBeenCalled();
    });

    it('should show error when name is missing', () => {
      component.payee.userPK = 'P001';
      component.payee.name = '';
      component.save();
      expect(payeeService.savePayee).not.toHaveBeenCalled();
    });

    it('should save successfully', fakeAsync(() => {
      component.payee.userPK = 'P001';
      component.payee.name = 'Test Payee';
      payeeService.savePayee.and.returnValue(of({ success: true, data: '1', rawData: '' }));
      component.save();
      tick();
      expect(payeeService.savePayee).toHaveBeenCalled();
    }));
  });

  describe('delete', () => {
    it('should not delete when sysPk is null', () => {
      component.sysPk = null;
      spyOn(window, 'confirm').and.returnValue(true);
      component.delete();
      expect(payeeService.deletePayee).not.toHaveBeenCalled();
    });
  });

  describe('goBack', () => {
    it('should navigate to payee list', () => {
      const router = TestBed.inject(Router);
      component.goBack();
      expect(router.navigate).toHaveBeenCalledWith(['/settings/payee']);
    });
  });

  describe('tab switching', () => {
    it('should switch tabs correctly', () => {
      component.activeTab = 'moreInfo';
      component.switchToSystemInfoTab();
      expect(component.activeTab).toBe('systemInfo');
      component.switchToMoreInfoTab();
      expect(component.activeTab).toBe('moreInfo');
    });
  });
});
