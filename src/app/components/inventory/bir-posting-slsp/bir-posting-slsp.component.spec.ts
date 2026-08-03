import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { BirPostingSlspComponent } from './bir-posting-slsp.component';
import { HttpService } from '../../../services/http.service';
import { AlertService } from '../../../services/alert.service';
import { DatabaseSelectionService } from '../../../services/database-selection.service';
import { Bir2307PdfService } from '../../../services/bir-2307-pdf.service';
import { ResponseDto } from '../../../models/dto/responseDto';
import { ResponseListDto } from '../../../models/dto/responseListDto';
import { BirTransactionDto, BirTransactionFilterDto, TransactionHeaderForBirDto } from '../../../models/dto/birTransactionDto';
import { PdfPreviewModalComponent } from '../../../components/shared/pdf-preview-modal/pdf-preview-modal.component';
import { DatabaseConfig } from '../../../models/dto/databaseConfig';

class MockHttpService {
  getAvailableDatabases = jasmine.createSpy('getAvailableDatabases').and.returnValue(of({
    success: true,
    data: JSON.stringify([{ DatabaseName: 'TestDB', DisplayName: 'Test DB', Server: 'localhost', IsActive: true }]),
    rawData: ''
  }));
  getBirTransactions = jasmine.createSpy('getBirTransactions').and.returnValue(of(new ResponseListDto<BirTransactionDto>()));
  getBirTransactionTotals = jasmine.createSpy('getBirTransactionTotals').and.returnValue(of({ success: true, data: '{}', rawData: '' }));
  getBirTransactionSummaryReport = jasmine.createSpy('getBirTransactionSummaryReport').and.returnValue(of({}));
  removeBirTransaction = jasmine.createSpy('removeBirTransaction').and.returnValue(of({ success: true, data: '', rawData: '' }));
  postBirTransactions = jasmine.createSpy('postBirTransactions').and.returnValue(of({ success: true, data: '', rawData: '' }));
  getTransactionHeadersByModuleType = jasmine.createSpy('getTransactionHeadersByModuleType').and.returnValue(of(new ResponseListDto<TransactionHeaderForBirDto>()));
  addBirTransaction = jasmine.createSpy('addBirTransaction').and.returnValue(of({ success: true, data: '', rawData: '' }));
}

class MockDbSelectionService {
  getCurrentDatabase = jasmine.createSpy('getCurrentDatabase').and.returnValue('TestDB');
  setCurrentDatabase = jasmine.createSpy('setCurrentDatabase');
}

class MockBir2307PdfService {
  generate2307PdfBlob = jasmine.createSpy('generate2307PdfBlob').and.returnValue(Promise.resolve(new Blob()));
}

describe('BirPostingSlspComponent', () => {
  let component: BirPostingSlspComponent;
  let fixture: ComponentFixture<BirPostingSlspComponent>;
  let httpService: MockHttpService;

  beforeEach(async () => {
    httpService = new MockHttpService();

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        BirPostingSlspComponent,
        PdfPreviewModalComponent
      ],
      providers: [
        { provide: HttpService, useValue: httpService },
        { provide: AlertService, useValue: {} },
        { provide: DatabaseSelectionService, useValue: new MockDbSelectionService() },
        { provide: Bir2307PdfService, useValue: new MockBir2307PdfService() }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BirPostingSlspComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize filters with current year and month', fakeAsync(() => {
    expect(component.filter.year).toBeTruthy();
    expect(component.filter.period).toBeTruthy();
    expect(component.filter.taxType).toBe(0);
    tick();
  }));

  it('should load databases and transactions on init', fakeAsync(() => {
    expect(httpService.getAvailableDatabases).toHaveBeenCalled();
    expect(httpService.getBirTransactions).toHaveBeenCalled();
    tick();
  }));

  it('should populate year options', () => {
    expect(component.yearOptions.length).toBe(5);
    expect(component.yearOptions[0].value).toBe(new Date().getFullYear().toString());
  });

  describe('areFiltersComplete', () => {
    it('should return true when all filters are set', () => {
      component.filter.year = '2024';
      component.filter.period = 'January';
      component.filter.taxType = 0;
      expect(component.areFiltersComplete()).toBe(true);
    });

    it('should return false when year is missing', () => {
      component.filter.year = null;
      component.filter.period = 'January';
      component.filter.taxType = 0;
      expect(component.areFiltersComplete()).toBe(false);
    });
  });

  describe('loadTransactions', () => {
    it('should skip loading when filters are incomplete', fakeAsync(() => {
      component.filter.year = null;
      component.loadTransactions();
      tick();
      expect(component.isLoading).toBe(false);
    }));

    it('should load transactions when filters are complete', fakeAsync(() => {
      component.filter.year = '2024';
      component.filter.period = 'January';
      component.filter.taxType = 0;
      component.loadTransactions();
      tick();
      expect(component.isLoading).toBe(false);
    }));
  });

  describe('onFilterChange', () => {
    it('should sync module type with taxType', fakeAsync(() => {
      component.filter.taxType = 0;
      component.filter.year = '2024';
      component.filter.period = 'January';
      component.onFilterChange();
      tick();
      expect(component.selectedModuleType).toBe('Sales');
    }));

    it('should set Purchases for taxType 1', fakeAsync(() => {
      component.filter.taxType = 1;
      component.filter.year = '2024';
      component.filter.period = 'January';
      component.onFilterChange();
      tick();
      expect(component.selectedModuleType).toBe('Purchases');
    }));
  });

  describe('getModuleTypeDescription', () => {
    it('should return mapped description', () => {
      expect(component.getModuleTypeDescription('CSHINVC')).toBe('Cash Invoice');
      expect(component.getModuleTypeDescription('CHGINVC')).toBe('Charge Invoice');
    });

    it('should return original for unmapped type', () => {
      expect(component.getModuleTypeDescription('UNKNOWN')).toBe('UNKNOWN');
    });

    it('should return empty for null', () => {
      expect(component.getModuleTypeDescription(null)).toBe('');
    });
  });

  describe('getQuarterFromPeriod', () => {
    it('should return Q1 for months 1-3', () => {
      expect(component.getQuarterFromPeriod('01')).toBe('Q1');
      expect(component.getQuarterFromPeriod('02')).toBe('Q1');
      expect(component.getQuarterFromPeriod('03')).toBe('Q1');
    });

    it('should return Q2 for months 4-6', () => {
      expect(component.getQuarterFromPeriod('04')).toBe('Q2');
      expect(component.getQuarterFromPeriod('06')).toBe('Q2');
    });

    it('should return Q3 for months 7-9', () => {
      expect(component.getQuarterFromPeriod('07')).toBe('Q3');
      expect(component.getQuarterFromPeriod('09')).toBe('Q3');
    });

    it('should return Q4 for months 10-12', () => {
      expect(component.getQuarterFromPeriod('10')).toBe('Q4');
      expect(component.getQuarterFromPeriod('12')).toBe('Q4');
    });
  });

  describe('getTaxTypeBadgeClass / getTaxTypeLabel', () => {
    it('should return correct badge for sales', () => {
      expect(component.getTaxTypeBadgeClass(0)).toBe('badge bg-success');
      expect(component.getTaxTypeLabel(0)).toBe('Sales');
    });

    it('should return correct badge for purchases', () => {
      expect(component.getTaxTypeBadgeClass(1)).toBe('badge bg-warning text-dark');
      expect(component.getTaxTypeLabel(1)).toBe('Purchases');
    });
  });

  describe('getPostedBadgeClass / getPostedStatusLabel', () => {
    it('should return correct badge for posted', () => {
      expect(component.getPostedBadgeClass(true)).toBe('badge bg-success');
      expect(component.getPostedStatusLabel(true)).toBe('Posted');
    });

    it('should return correct badge for unposted', () => {
      expect(component.getPostedBadgeClass(false)).toBe('badge bg-secondary');
      expect(component.getPostedStatusLabel(false)).toBe('Unposted');
    });
  });

  describe('totals', () => {
    it('should calculate total amount', () => {
      component.transactions = [
        { totalAmount: 1000 },
        { totalAmount: 2000 }
      ] as BirTransactionDto[];
      expect(component.getTotalAmount()).toBe(3000);
    });

    it('should calculate total taxable', () => {
      component.transactions = [
        { totalTaxable: 800 },
        { totalTaxable: 1200 }
      ] as BirTransactionDto[];
      expect(component.getTotalTaxable()).toBe(2000);
    });

    it('should calculate total tax amount', () => {
      component.transactions = [
        { taxAmount: 100 },
        { taxAmount: 200 }
      ] as BirTransactionDto[];
      expect(component.getTotalTaxAmount()).toBe(300);
    });
  });

  describe('transaction selection', () => {
    it('should toggle transaction selection', () => {
      component.transactionHeaders = [
        { sysPK_TransH: 1 } as TransactionHeaderForBirDto
      ];
      component.toggleTransactionSelection({ sysPK_TransH: 1 } as TransactionHeaderForBirDto);
      expect(component.selectedTransactions.has(1)).toBe(true);
      component.toggleTransactionSelection({ sysPK_TransH: 1 } as TransactionHeaderForBirDto);
      expect(component.selectedTransactions.has(1)).toBe(false);
    });

    it('should select all transactions', () => {
      component.transactionHeaders = [
        { sysPK_TransH: 1 },
        { sysPK_TransH: 2 }
      ] as TransactionHeaderForBirDto[];
      component.selectAllTransactions();
      expect(component.selectedTransactions.has(1)).toBe(true);
      expect(component.selectedTransactions.has(2)).toBe(true);
    });

    it('should deselect all transactions', () => {
      component.selectedTransactions.add(1);
      component.selectedTransactions.add(2);
      component.deselectAllTransactions();
      expect(component.selectedTransactions.size).toBe(0);
    });

    it('should return false for areAllTransactionsSelected when no headers', () => {
      component.transactionHeaders = [];
      expect(component.areAllTransactionsSelected()).toBe(false);
    });
  });

  describe('transactionExists', () => {
    it('should always return false', () => {
      expect(component.transactionExists(1)).toBe(false);
    });
  });
});
