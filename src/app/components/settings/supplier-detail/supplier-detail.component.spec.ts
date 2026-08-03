import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject } from 'rxjs';
import { SupplierDetailComponent } from './supplier-detail.component';
import { SupplierService } from '../../../services/supplier.service';
import { AlertService } from '../../../services/alert.service';
import { UniversalMasterDto } from '../../../models/dto/universalMasterDto';

class MockSupplierService {
  getSupplierById = jasmine.createSpy('getSupplierById').and.returnValue(of({
    sysPk: 1, userPK: 'S001', name: 'Supplier 1', module: 'SUPL'
  }));
  saveSupplier = jasmine.createSpy('saveSupplier').and.returnValue(of({ success: true, data: '1', rawData: '' }));
  deleteSupplier = jasmine.createSpy('deleteSupplier').and.returnValue(of({ success: true, data: '', rawData: '' }));
}

class MockRouter {
  navigate = jasmine.createSpy('navigate');
  navigateByUrl = jasmine.createSpy('navigateByUrl');
  url = '/settings/supplier/1';
  events = new Subject<any>();
  parseUrl = jasmine.createSpy('parseUrl').and.returnValue({});
  serializeUrl = jasmine.createSpy('serializeUrl').and.returnValue('/settings/supplier');
  createUrlTree = jasmine.createSpy('createUrlTree').and.returnValue({});
}

class MockAlertService {
  setCustomErrorAlert = jasmine.createSpy('setCustomErrorAlert');
  setCustomSuccessAlert = jasmine.createSpy('setCustomSuccessAlert');
}

describe('SupplierDetailComponent', () => {
  let component: SupplierDetailComponent;
  let fixture: ComponentFixture<SupplierDetailComponent>;
  let supplierService: MockSupplierService;

  beforeEach(async () => {
    supplierService = new MockSupplierService();

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        SupplierDetailComponent
      ],
      providers: [
        { provide: SupplierService, useValue: supplierService },
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

    fixture = TestBed.createComponent(SupplierDetailComponent);
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

  it('should initialize with supplier module SUPL', () => {
    expect(component.supplier.module).toBe('SUPL');
  });

  describe('save', () => {
    it('should show error when userPK is missing', () => {
      component.supplier.userPK = '';
      component.supplier.name = 'Test';
      component.save();
      expect(supplierService.saveSupplier).not.toHaveBeenCalled();
    });

    it('should show error when name is missing', () => {
      component.supplier.userPK = 'S001';
      component.supplier.name = '';
      component.save();
      expect(supplierService.saveSupplier).not.toHaveBeenCalled();
    });

    it('should save successfully', fakeAsync(() => {
      component.supplier.userPK = 'S001';
      component.supplier.name = 'Test Supplier';
      supplierService.saveSupplier.and.returnValue(of({ success: true, data: '1', rawData: '' }));
      component.save();
      tick();
      expect(supplierService.saveSupplier).toHaveBeenCalled();
    }));
  });

  describe('delete', () => {
    it('should not delete when sysPk is null', () => {
      component.sysPk = null;
      spyOn(window, 'confirm').and.returnValue(true);
      component.delete();
      expect(supplierService.deleteSupplier).not.toHaveBeenCalled();
    });
  });

  describe('goBack', () => {
    it('should navigate to supplier list', () => {
      const router = TestBed.inject(Router);
      component.goBack();
      expect(router.navigate).toHaveBeenCalledWith(['/settings/supplier']);
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
