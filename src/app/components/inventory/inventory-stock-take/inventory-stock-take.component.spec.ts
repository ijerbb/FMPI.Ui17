import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule, Router } from '@angular/router';
import { of } from 'rxjs';
import { InventoryStockTakeComponent } from './inventory-stock-take.component';
import { HttpService } from '../../../services/http.service';
import { StockTakeSessionDto } from '../../../models/dto/stockTakeSessionDto';
import { ResponseListDto } from '../../../models/dto/responseListDto';
import { PaginationComponent } from '../../../components/shared/pagination/pagination.component';

class MockHttpService {
  listStockTakeSessions = jasmine.createSpy('listStockTakeSessions').and.returnValue(of(new ResponseListDto<StockTakeSessionDto>()));
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

describe('InventoryStockTakeComponent', () => {
  let component: InventoryStockTakeComponent;
  let fixture: ComponentFixture<InventoryStockTakeComponent>;
  let httpService: MockHttpService;

  beforeEach(async () => {
    httpService = new MockHttpService();

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterModule.forRoot([]),
        InventoryStockTakeComponent,
        PaginationComponent
      ],
      providers: [
        { provide: HttpService, useValue: httpService },
        { provide: Router, useValue: new MockRouter() }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryStockTakeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have header text set to Stock Take Sessions', () => {
    expect(component.headerText).toBe('Stock Take Sessions');
  });

  it('should call loadList on init', () => {
    expect(httpService.listStockTakeSessions).toHaveBeenCalled();
  });

  it('should initialize with empty sessions', () => {
    expect(component.sessions.lists).toEqual([]);
    expect(component.filteredSessions).toEqual([]);
  });

  describe('getTypeName / getStatusName', () => {
    it('should return name for valid type id', () => {
      expect(component.getTypeName(1)).toBe('Partial');
      expect(component.getTypeName(2)).toBe('Full');
    });

    it('should return the id when type not found', () => {
      expect(component.getTypeName(99)).toBe(99);
    });

    it('should return name for valid status id', () => {
      expect(component.getStatusName(1)).toBe('Draft');
      expect(component.getStatusName(2)).toBe('In-Progress');
      expect(component.getStatusName(3)).toBe('Review');
      expect(component.getStatusName(4)).toBe('Posted');
    });
  });

  describe('onSearch', () => {
    it('should filter sessions by name when search string provided', () => {
      component.sessions.lists = [
        { id: 1, name: 'Stock Take 1', type: 1, status: 1 },
        { id: 2, name: 'Another Stock Take', type: 2, status: 2 }
      ];
      component.filteredSessions = [...component.sessions.lists];
      component.searchStr = 'another';
      component.onSearch();
      expect(component.filteredSessions.length).toBe(1);
      expect(component.filteredSessions[0].name).toBe('Another Stock Take');
    });

    it('should reset to all sessions when search string is empty', () => {
      component.sessions.lists = [
        { id: 1, name: 'Stock Take 1' },
        { id: 2, name: 'Stock Take 2' }
      ];
      component.filteredSessions = [...component.sessions.lists];
      component.searchStr = '';
      component.onSearch();
      expect(component.filteredSessions).toEqual(component.sessions.lists);
    });
  });

  describe('onClearSearch', () => {
    it('should clear search string and reset sessions', () => {
      component.sessions.lists = [{ id: 1, name: 'Test' }];
      component.filteredSessions = [];
      component.searchStr = 'test';
      component.onClearSearch();
      expect(component.searchStr).toBe('');
      expect(component.filteredSessions).toEqual(component.sessions.lists);
    });
  });

  describe('bulk selection', () => {
    it('should toggle selection', () => {
      component.filteredSessions = [{ id: 1, name: 'Test' }, { id: 2, name: 'Test2' }];
      component.toggleSelection(1);
      expect(component.selectedItems.has(1)).toBe(true);
      component.toggleSelection(1);
      expect(component.selectedItems.has(1)).toBe(false);
    });

    it('should toggle select all', () => {
      component.filteredSessions = [
        { id: 1, name: 'Test' },
        { id: 2, name: 'Test2' }
      ];
      component.toggleSelectAll();
      component.selectAll = true;
      component.toggleSelectAll();
      expect(component.selectedItems.size).toBe(2);
    });
  });

  describe('handleBulkDelete', () => {
    it('should not delete when no items selected', fakeAsync(() => {
      component.handleBulkDelete();
      tick();
    }));
  });

  describe('navigation', () => {
    it('should navigate to edit page', fakeAsync(() => {
      component.edit({ id: 1, name: 'Test Session' } as StockTakeSessionDto);
    }));

    it('should navigate to new page', fakeAsync(() => {
      component.addNew();
    }));
  });

  describe('clickPageTasks', () => {
    it('should call loadList with page number', fakeAsync(() => {
      component.clickPageTasks(3);
      tick();
    }));
  });
});
