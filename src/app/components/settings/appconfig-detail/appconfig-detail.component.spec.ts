import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { of, Subject } from 'rxjs';
import { AppconfigDetailComponent } from './appconfig-detail.component';
import { ApplicationConfigurationService } from '../../../services/application-configuration.service';
import { AlertService } from '../../../services/alert.service';
import { ApplicationConfigurationDto } from '../../../models/dto/applicationConfigurationDto';

class MockAlertService {
  setCustomSuccessAlert = jasmine.createSpy('setCustomSuccessAlert');
  setCustomErrorAlert = jasmine.createSpy('setCustomErrorAlert');
}

class MockConfigService {
  getConfigById = jasmine.createSpy('getConfigById').and.returnValue(of({
    sysPk: 1, key: 'apiUrl', value: '{"url": "http://localhost"}', description: 'API URL', category: 'Setting'
  }));
  saveConfig = jasmine.createSpy('saveConfig').and.returnValue(of({ success: true, data: '1', rawData: '' }));
  deleteConfig = jasmine.createSpy('deleteConfig').and.returnValue(of({ success: true, data: '', rawData: '' }));
}

class MockRouter {
  navigate = jasmine.createSpy('navigate');
  navigateByUrl = jasmine.createSpy('navigateByUrl');
  url = '/settings/appconfig/1';
  events = new Subject<any>();
  parseUrl = jasmine.createSpy('parseUrl').and.returnValue({});
  serializeUrl = jasmine.createSpy('serializeUrl').and.returnValue('/settings/appconfig');
  createUrlTree = jasmine.createSpy('createUrlTree').and.returnValue({});
}

describe('AppconfigDetailComponent', () => {
  let component: AppconfigDetailComponent;
  let fixture: ComponentFixture<AppconfigDetailComponent>;
  let configService: MockConfigService;

  beforeEach(async () => {
    configService = new MockConfigService();

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterModule.forRoot([]),
        AppconfigDetailComponent
      ],
      providers: [
        { provide: ApplicationConfigurationService, useValue: configService },
        { provide: Router, useValue: new MockRouter() },
        { provide: AlertService, useValue: new MockAlertService() },
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

    fixture = TestBed.createComponent(AppconfigDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load configuration on init for numeric ID', fakeAsync(() => {
    expect(component.sysPk).toBe(1);
    expect(component.isEditMode).toBe(false);
    expect(configService.getConfigById).toHaveBeenCalledWith(1);
    tick();
    expect(component.loading).toBe(false);
  }));

  it('should start in edit mode for new route', fakeAsync(() => {
    TestBed.resetTestingModule();
    const newConfigService = new MockConfigService();
    const newMockRouter = new MockRouter();

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterModule.forRoot([]),
        AppconfigDetailComponent
      ],
      providers: [
        { provide: ApplicationConfigurationService, useValue: newConfigService },
        { provide: Router, useValue: newMockRouter },
        { provide: AlertService, useValue: new MockAlertService() },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: { get: (key: string) => key === 'id' ? 'new' : null },
              params: {},
              url: [{ path: 'new' }]
            }
          }
        }
      ]
    });

    const newFixture = TestBed.createComponent(AppconfigDetailComponent);
    const newComponent = newFixture.componentInstance;
    newFixture.detectChanges();
    tick();

    expect(newComponent.isEditMode).toBe(true);
    expect(newComponent.sysPk).toBeNull();
  }));

  describe('parseJsonToForm', () => {
    it('should parse valid JSON to form fields', () => {
      component.jsonValue = '{"key": "value", "count": 42}';
      component.parseJsonToForm();
      expect(component.formFields.key).toBe('value');
      expect(component.formFields.count).toBe(42);
      expect(component.jsonValid).toBe(true);
    });

    it('should set error for invalid JSON', () => {
      component.jsonValue = '{invalid json}';
      component.parseJsonToForm();
      expect(component.jsonError).toBe('Invalid JSON format');
      expect(component.jsonValid).toBe(false);
    });
  });

describe('updateJsonFromForm', () => {
    it('should stringify form fields to JSON', () => {
      component.formFields = { key: 'value', num: 10 };
      component.updateJsonFromForm();
      expect(component.jsonValue).toContain('"key": "value"');
      expect(component.jsonValue).toContain('"num": 10');
    });
  });

  describe('validateJson', () => {
    it('should validate valid JSON', () => {
      component.jsonValue = '{"valid": true}';
      component.validateJson();
      expect(component.jsonValid).toBe(true);
      expect(component.jsonError).toBeNull();
    });

    it('should mark invalid JSON', () => {
      component.jsonValue = '{broken';
      component.validateJson();
      expect(component.jsonValid).toBe(false);
      expect(component.jsonError).toBe('Invalid JSON format');
    });
  });

  describe('save', () => {
    it('should show error when key is missing', () => {
      component.config.key = '';
      component.config.description = 'Test';
      component.save();
      expect(configService.saveConfig).not.toHaveBeenCalled();
    });

    it('should save successfully', fakeAsync(() => {
      component.config.key = 'testKey';
      component.config.description = 'Test desc';
      component.config.category = 'Setting';
      component.formFields = { test: true };
      configService.saveConfig.and.returnValue(of({ success: true, data: '1', rawData: '' }));
      component.save();
      tick();
      expect(configService.saveConfig).toHaveBeenCalled();
    }));

it('should show error for invalid JSON during save', () => {
       component.config.key = 'testKey';
       component.config.description = 'Test desc';
       component.jsonValue = '{invalid json';
       component.activeTab = 'json';
       component.save();
       expect(configService.saveConfig).not.toHaveBeenCalled();
     });
  });

  describe('delete', () => {
    it('should not delete when sysPk is null', () => {
      component.sysPk = null;
      spyOn(window, 'confirm').and.returnValue(true);
      component.delete();
      expect(configService.deleteConfig).not.toHaveBeenCalled();
    });
  });

  describe('goBack', () => {
    it('should navigate to appconfig list', () => {
      const router = TestBed.inject(Router);
      component.goBack();
      expect(router.navigate).toHaveBeenCalledWith(['/settings/appconfig']);
    });
  });

  describe('addField / removeField', () => {
    it('should add a field to formFields', () => {
      component.formFields = {};
      component.newFieldName = 'testField';
      component.newFieldType = 'string';
      component.confirmAddField();
      expect(component.formFields.testField).toBe('');
    });

    it('should remove a field from formFields', () => {
      component.formFields = { field1: 'value1', field2: 'value2' };
      component.fieldToDelete = 'field1';
      component.confirmDeleteField();
      expect(component.formFields.field1).toBeUndefined();
      expect(component.formFields.field2).toBe('value2');
    });
  });

  describe('tab switching', () => {
    it('should switch to form tab', () => {
      component.jsonValue = '{"key": "value"}';
      component.activeTab = 'json';
      component.switchToFormTab();
      expect(component.activeTab).toBe('form');
    });

    it('should switch to json tab', () => {
      component.jsonValue = '{"key": "value"}';
      component.activeTab = 'form';
      component.switchToJsonTab();
      expect(component.activeTab).toBe('json');
    });
  });

  describe('getFieldType', () => {
    it('should return type for string', () => {
      expect(component.getFieldType('hello')).toBe('string');
    });

    it('should return type for number', () => {
      expect(component.getFieldType(42)).toBe('number');
    });

    it('should return type for boolean', () => {
      expect(component.getFieldType(true)).toBe('boolean');
    });

    it('should return null for null value', () => {
      expect(component.getFieldType(null)).toBe('null');
    });

    it('should return array for array', () => {
      expect(component.getFieldType([1, 2, 3])).toBe('array');
    });
  });

  describe('formatJson', () => {
    it('should format valid JSON', () => {
      component.jsonValue = '{"key":"value"}';
      component.formatJson();
      expect(component.jsonValue).toBe('{\n  "key": "value"\n}');
    });

    it('should set error for invalid JSON', () => {
      component.jsonValue = '{broken';
      component.formatJson();
      expect(component.jsonError).toBe('Cannot format invalid JSON');
    });
  });

  describe('getFormFieldKeys', () => {
    it('should return keys of formFields', () => {
      component.formFields = { a: 1, b: 2 };
      const keys = component.getFormFieldKeys();
      expect(keys).toContain('a');
      expect(keys).toContain('b');
      expect(keys.length).toBe(2);
    });

    it('should return empty array for empty formFields', () => {
      component.formFields = {};
      const keys = component.getFormFieldKeys();
      expect(keys).toEqual([]);
    });
  });
});
