import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginationComponent } from './pagination.component';

describe('PaginationComponent', () => {
  let component: PaginationComponent;
  let fixture: ComponentFixture<PaginationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginationComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PaginationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default values', () => {
    expect(component.pageNum).toBe(1);
    expect(component.pageSize).toBe(10);
    expect(component.totalRecords).toBe(0);
  });

  describe('getTotalPages', () => {
    it('should return 0 when no records', () => {
      component.totalRecords = 0;
      expect(component.getTotalPages()).toBe(0);
    });

    it('should return correct page count', () => {
      component.totalRecords = 25;
      component.pageSize = 10;
      expect(component.getTotalPages()).toBe(3);
    });

    it('should return 1 for fewer records than page size', () => {
      component.totalRecords = 5;
      component.pageSize = 10;
      expect(component.getTotalPages()).toBe(1);
    });
  });

  describe('getStartRecord', () => {
    it('should return 0 when no records', () => {
      component.totalRecords = 0;
      expect(component.getStartRecord()).toBe(0);
    });

    it('should return correct start record for page 1', () => {
      component.totalRecords = 20;
      component.pageNum = 1;
      component.pageSize = 10;
      expect(component.getStartRecord()).toBe(1);
    });

    it('should return correct start record for page 2', () => {
      component.totalRecords = 30;
      component.pageNum = 2;
      component.pageSize = 10;
      expect(component.getStartRecord()).toBe(11);
    });
  });

  describe('getEndRecord', () => {
    it('should return 0 when no records', () => {
      component.totalRecords = 0;
      expect(component.getEndRecord()).toBe(0);
    });

    it('should return correct end record for full page', () => {
      component.totalRecords = 20;
      component.pageNum = 1;
      component.pageSize = 10;
      expect(component.getEndRecord()).toBe(10);
    });

    it('should return totalRecords for partial last page', () => {
      component.totalRecords = 25;
      component.pageNum = 3;
      component.pageSize = 10;
      expect(component.getEndRecord()).toBe(25);
    });
  });

  describe('onPageChange', () => {
    it('should emit page number for valid page', () => {
      let emitted: number | undefined;
      component.pageChange.subscribe((data: number) => { emitted = data; });
      component.onPageChange(5);
      expect(emitted).toBe(5);
    });

    it('should not emit for page less than 1', () => {
      let emitted: number | undefined;
      component.pageChange.subscribe((data: number) => { emitted = data; });
      component.onPageChange(0);
      expect(emitted).toBeUndefined();
    });

    it('should not emit for negative page', () => {
      let emitted: number | undefined;
      component.pageChange.subscribe((data: number) => { emitted = data; });
      component.onPageChange(-1);
      expect(emitted).toBeUndefined();
    });
  });
});
