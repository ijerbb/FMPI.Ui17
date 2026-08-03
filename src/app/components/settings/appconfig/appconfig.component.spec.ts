import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { of } from 'rxjs';

import { AppconfigComponent } from './appconfig.component';
import { ApplicationConfigurationService } from '../../../services/application-configuration.service';
import { AlertService } from '../../../services/alert.service';
import { ApplicationConfigurationDto } from '../../../models/dto/applicationConfigurationDto';
import { ListComponent } from '../../../components/shared/list/list.component';
import { PaginationComponent } from '../../../components/shared/pagination/pagination.component';

class MockConfigService {
  getAllConfigurations = jasmine.createSpy('getAllConfigurations').and.returnValue(of([]));
  deleteMultipleConfigurations = jasmine.createSpy('deleteMultipleConfigurations').and.returnValue(of({ success: true, data: '', rawData: '' }));
}

class MockAlertService {
  setCustomErrorAlert = jasmine.createSpy('setCustomErrorAlert');
  setCustomSuccessAlert = jasmine.createSpy('setCustomSuccessAlert');
  setCustomInfoAlert = jasmine.createSpy('setCustomInfoAlert');
}

describe('AppconfigComponent', () => {
  let component: AppconfigComponent;
  let fixture: ComponentFixture<AppconfigComponent>;
  let configService: MockConfigService;

  beforeEach(async () => {
    configService = new MockConfigService();

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterModule.forRoot([]),
        AppconfigComponent,
        ListComponent,
        PaginationComponent
      ],
      providers: [
        { provide: ApplicationConfigurationService, useValue: configService },
        { provide: AlertService, useValue: new MockAlertService() }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppconfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call loadConfigurations on init', () => {
    expect(configService.getAllConfigurations).toHaveBeenCalled();
  });

  it('should have inline config defined', () => {
    expect(component.config).toBeTruthy();
    expect(component.config.moduleType).toBe('APPCONFIG');
    expect(component.config.title).toBe('Application Configuration');
    expect(component.config.columns.length).toBe(4);
  });

  describe('applyFilters', () => {
    it('should return all configurations when search string is empty', () => {
      component.configurations = [
        { sysPk: 1, key: 'key1', value: '{}', description: 'Desc 1' },
        { sysPk: 2, key: 'key2', value: '{}', description: 'Desc 2' }
      ];
      component.applyFilters();
      expect(component.filteredConfigurations).toEqual(component.configurations);
    });

    it('should filter by key', () => {
      component.configurations = [
        { sysPk: 1, key: 'apiUrl', value: '{}', description: 'API URL' },
        { sysPk: 2, key: 'dbConn', value: '{}', description: 'DB Connection' }
      ];
      component.searchStr = 'api';
      component.applyFilters();
      expect(component.filteredConfigurations.length).toBe(1);
      expect(component.filteredConfigurations[0].key).toBe('apiUrl');
    });

    it('should filter by description', () => {
      component.configurations = [
        { sysPk: 1, key: 'apiUrl', value: '{}', description: 'API URL' },
        { sysPk: 2, key: 'dbConn', value: '{}', description: 'Database Connection' }
      ];
      component.searchStr = 'database';
      component.applyFilters();
      expect(component.filteredConfigurations.length).toBe(1);
    });

    it('should filter by category', () => {
      component.configurations = [
        { sysPk: 1, key: 'key1', value: '{}', description: 'Desc', category: 'Feature' },
        { sysPk: 2, key: 'key2', value: '{}', description: 'Desc', category: 'Setting' }
      ];
      component.searchStr = 'feature';
      component.applyFilters();
      expect(component.filteredConfigurations.length).toBe(1);
    });
  });

  describe('onSearch / onClearSearch', () => {
    it('onSearch should apply filters', () => {
      component.configurations = [
        { sysPk: 1, key: 'apiUrl', value: '{}', description: 'API' }
      ];
      component.searchStr = 'api';
      component.onSearch();
      expect(component.filteredConfigurations.length).toBe(1);
    });

    it('onClearSearch should clear search string', () => {
      component.configurations = [
        { sysPk: 1, key: 'apiUrl', value: '{}', description: 'API' }
      ];
      component.searchStr = 'api';
      component.onClearSearch();
      expect(component.searchStr).toBe('');
    });
  });

  describe('handleBulkDelete', () => {
    it('should call deleteMultipleConfigurations when confirmed', fakeAsync(() => {
      spyOn(window, 'confirm').and.returnValue(true);
      configService.deleteMultipleConfigurations.and.returnValue(of({ success: true, data: '', rawData: '' }));
      component.handleBulkDelete([1, 2]);
      tick();
      expect(configService.deleteMultipleConfigurations).toHaveBeenCalledWith([1, 2]);
    }));

    it('should skip delete when ids array is empty', fakeAsync(() => {
      component.handleBulkDelete([]);
      tick();
      expect(configService.deleteMultipleConfigurations).not.toHaveBeenCalled();
    }));
  });

  describe('formatJsonPreview', () => {
    it('should return dash for empty value', () => {
      expect(component.formatJsonPreview('')).toBe('-');
    });

it('should return truncated JSON for long values', () => {
       const longJson = JSON.stringify({ a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9, j: 10, k: 11, l: 12, m: 13, n: 14 });
       const result = component.formatJsonPreview(longJson);
       expect(result.length).toBeLessThanOrEqual(53);
       expect(result).toContain('...');
     });

    it('should return full string for short values', () => {
      const result = component.formatJsonPreview('short');
      expect(result).toBe('short');
    });
  });

  describe('selection', () => {
    it('should toggle selection', () => {
      component.toggleSelection(1);
      expect(component.selectedItems.has(1)).toBe(true);
      component.toggleSelection(1);
      expect(component.selectedItems.has(1)).toBe(false);
    });

    it('should update select all when all items selected', () => {
      component.filteredConfigurations = [
        { sysPk: 1, key: 'k1', value: '{}' },
        { sysPk: 2, key: 'k2', value: '{}' }
      ];
      component.selectedItems.add(1);
      component.selectedItems.add(2);
      component.updateSelectAll();
      expect(component.selectAll).toBe(true);
    });
  });

  describe('onPageChange', () => {
    it('should slice filtered configurations by page', () => {
      component.configurations = [
        { sysPk: 1, key: 'k1', value: '{}' },
        { sysPk: 2, key: 'k2', value: '{}' },
        { sysPk: 3, key: 'k3', value: '{}' }
      ];
      component.filteredConfigurations = [...component.configurations];
      component.pageSize = 2;
      component.onPageChange(2);
      expect(component.filteredConfigurations.length).toBe(1);
    });
  });
});
