import { TestBed } from '@angular/core/testing';
import { Bir2307PdfService } from './bir-2307-pdf.service';
import { ApplicationConfigurationService } from './application-configuration.service';
import { BirSlspFormData } from '../models/dto/birTransactionDto';
import { Observable } from 'rxjs';

class MockApplicationConfigurationService {
  configurationChanged$ = new Observable<void>();
  getConfigByKey(key: string): Observable<any> {
    return new Observable(subscriber => {
      subscriber.next({
        key: key,
        value: JSON.stringify({
          SignatoryName: 'Juan Dela Cruz',
          SignatoryDesignation: 'Authorized Signatory',
          SignatoryTinNo: '000-000-000-000',
          PayorName: 'Test Payor Corp',
          PayorAddress: '123 Main St, Metro Manila 1234',
          PayorTinNo: '123-456-789-000'
        })
      });
      subscriber.complete();
    });
  }
}

describe('Bir2307PdfService', () => {
  let service: Bir2307PdfService;
  let mockAppConfigService: MockApplicationConfigurationService;

  beforeEach(() => {
    mockAppConfigService = new MockApplicationConfigurationService();
    TestBed.configureTestingModule({
      providers: [
        Bir2307PdfService,
        { provide: ApplicationConfigurationService, useValue: mockAppConfigService }
      ]
    });
    service = TestBed.inject(Bir2307PdfService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have the correct template path', () => {
    const config = (service as any).config;
    expect(config.templatePath).toBe('assets/templates/2307.pdf');
    expect(Object.keys(config.fieldPositions).length).toBeGreaterThan(0);
  });

  describe('clearCache', () => {
    it('should clear the cached BIR information', () => {
      (service as any).birInformation = { test: 'data' };
      (service as any).birInfoLoadPromise = Promise.resolve({} as any);

      service.clearCache();

      expect((service as any).birInformation).toBeNull();
      expect((service as any).birInfoLoadPromise).toBeNull();
    });
  });

  describe('generate2307Pdf', () => {
    it('should generate PDF and attempt download', async () => {
      const mockFormData: BirSlspFormData = {
        atcCode: 'WC158',
        year: '2024',
        period: '01',
        payeeTinNo: '111-222-333-444',
        payeeName: 'Test Payee',
        payeeRegisteredAddress: '456 Oak Ave, Quezon City 1100',
        payeeZipCode: '1100',
        totalAmount: 10000,
        taxWithheld: 1000,
        transNum: 'TEST001',
        source: 'Sales'
      };

      const originalCreateObjectURL = window.URL.createObjectURL;
      const originalCreateElement = document.createElement;
      window.URL.createObjectURL = jasmine.createSpy('createObjectURL').and.returnValue('blob:url');
      document.createElement = jasmine.createSpy('createElement').and.returnValue({
        href: '',
        download: '',
        click: jasmine.createSpy('click'),
        style: {}
      });

      try {
        await service.generate2307Pdf(mockFormData);
        expect(window.URL.createObjectURL).toHaveBeenCalled();
      } finally {
        window.URL.createObjectURL = originalCreateObjectURL;
        document.createElement = originalCreateElement;
      }
    });

    it('should reject with error message when BIR info is not found', async () => {
      TestBed.resetTestingModule();
      const mockConfigService = {
        getConfigByKey: jasmine.createSpy('getConfigByKey').and.returnValue(new Observable(subscriber => {
          subscriber.next(null);
          subscriber.complete();
        })),
        configurationChanged$: new Observable<void>()
      };

      TestBed.configureTestingModule({
        providers: [
          Bir2307PdfService,
          { provide: ApplicationConfigurationService, useValue: mockConfigService }
        ]
      });
      service = TestBed.inject(Bir2307PdfService);

      const mockFormData: BirSlspFormData = {
        atcCode: 'WC158',
        year: '2024',
        period: '01',
        payeeTinNo: '111-222-333-444',
        payeeName: 'Test Payee'
      };

      await expectAsync(service.generate2307Pdf(mockFormData)).toBeRejectedWithError(/BIRInformation configuration not found/);
    });
  });

  describe('generate2307PdfBlob', () => {
    it('should return a Blob', async () => {
      const mockFormData: BirSlspFormData = {
        atcCode: 'WC158',
        year: '2024',
        period: '01',
        payeeTinNo: '111-222-333-444',
        payeeName: 'Test Payee',
        payeeRegisteredAddress: '456 Oak Ave, Quezon City 1100',
        payeeZipCode: '1100',
        totalAmount: 10000,
        taxWithheld: 1000,
        transNum: 'TEST001'
      };

      const blob = await service.generate2307PdfBlob(mockFormData);
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('application/pdf');
    });
  });

  describe('formatPeriod', () => {
    it('should format period from date correctly', () => {
      const result = (service as any).formatPeriod('2024', '01', 'from');
      expect(result).toBe('01 01 2024');
    });

    it('should format period to date correctly', () => {
      const result = (service as any).formatPeriod('2024', '01', 'to');
      expect(result).toBe('01 31 2024');
    });

    it('should return default format when year is missing', () => {
      const result = (service as any).formatPeriod(null, '01', 'from');
      expect(result).toBe('MM DD YY');
    });

    it('should return default format when period is missing', () => {
      const result = (service as any).formatPeriod('2024', null, 'from');
      expect(result).toBe('MM DD YY');
    });

    it('should format February to date correctly (leap year)', () => {
      const result = (service as any).formatPeriod('2024', '02', 'to');
      expect(result).toBe('02 29 2024');
    });

    it('should format February to date correctly (non-leap year)', () => {
      const result = (service as any).formatPeriod('2023', '02', 'to');
      expect(result).toBe('02 28 2023');
    });
  });

  describe('formatTin', () => {
    it('should remove dashes and spaces from TIN', () => {
      const result = (service as any).formatTin('123-456-789-000');
      expect(result).toBe('123456789000');
    });

    it('should handle TIN with spaces only', () => {
      const result = (service as any).formatTin('123 456 789 000');
      expect(result).toBe('123456789000');
    });

    it('should return empty string for null TIN', () => {
      const result = (service as any).formatTin(null);
      expect(result).toBe('');
    });

    it('should return empty string for undefined TIN', () => {
      const result = (service as any).formatTin(undefined);
      expect(result).toBe('');
    });
  });

  describe('getQuarterMonthAmount', () => {
    it('should return formatted amount for first month of quarter (January)', () => {
      const result = (service as any).getQuarterMonthAmount('January', 'first', 3000);
      expect(result).toBe('3,000.00');
    });

    it('should return empty for April as second month (April is first of Q2)', () => {
      const result = (service as any).getQuarterMonthAmount('April', 'second', 3000);
      expect(result).toBe('');
    });

    it('should return empty for July as third month (July is first of Q3)', () => {
      const result = (service as any).getQuarterMonthAmount('July', 'third', 3000);
      expect(result).toBe('');
    });

    it('should return empty string for non-matching month position', () => {
      const result = (service as any).getQuarterMonthAmount('February', 'first', 3000);
      expect(result).toBe('');
    });

    it('should return empty string when totalAmount is null', () => {
      const result = (service as any).getQuarterMonthAmount('January', 'first', null);
      expect(result).toBe('');
    });

    it('should return empty string when period is null', () => {
      const result = (service as any).getQuarterMonthAmount(null, 'first', 3000);
      expect(result).toBe('');
    });

    it('should return formatted amount for October (Q4 first month)', () => {
      const result = (service as any).getQuarterMonthAmount('October', 'first', 5000);
      expect(result).toBe('5,000.00');
    });
  });
});
