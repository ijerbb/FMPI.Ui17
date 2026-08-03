import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PayeeService } from './payee.service';
import { environment } from '../../environments/environment';
import { UniversalMasterDto, UniversalMasterSaveDto } from '../models/dto/universalMasterDto';
import { ResponseDto } from '../models/dto/responseDto';

describe('PayeeService', () => {
  let service: PayeeService;
  let httpMock: HttpTestingController;
  const baseUrl = environment.apiUrl + '/Payee';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(PayeeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllPayees', () => {
    it('should GET all payees from the API', (done) => {
      const mockPayees: UniversalMasterDto[] = [
        { sysPk: 1, userPK: 'P001', name: 'Payee 1', module: 'SUPLNT' },
        { sysPk: 2, userPK: 'P002', name: 'Payee 2', module: 'SUPLNT' }
      ];

      service.getAllPayees().subscribe(payees => {
        expect(payees.length).toBe(2);
        expect(payees[0].name).toBe('Payee 1');
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}/GetAll`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPayees);
    });
  });

  describe('getPayeeByUserPK', () => {
    it('should GET payee by UserPK', (done) => {
      const mockPayee: UniversalMasterDto = {
        sysPk: 1, userPK: 'P001', name: 'Payee 1', module: 'SUPLNT'
      };

      service.getPayeeByUserPK('P001').subscribe(payee => {
        expect(payee.userPK).toBe('P001');
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}/GetByUserPK?userPK=P001`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPayee);
    });
  });

  describe('getPayeeById', () => {
    it('should GET payee by ID', (done) => {
      const mockPayee: UniversalMasterDto = {
        sysPk: 3, userPK: 'P003', name: 'Payee 3', module: 'SUPLNT'
      };

      service.getPayeeById(3).subscribe(payee => {
        expect(payee.sysPk).toBe(3);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}/GetById?id=3`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPayee);
    });
  });

  describe('savePayee', () => {
    it('should POST to save a new payee', (done) => {
      const payeeDto: UniversalMasterSaveDto = {
        userPK: 'P099', name: 'New Payee', module: 'SUPLNT'
      };
      const mockResponse: ResponseDto = { success: true, data: '99', rawData: '' };

      service.savePayee(payeeDto).subscribe(response => {
        expect(response.success).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}/Save`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payeeDto);
      req.flush(mockResponse);
    });
  });

  describe('deletePayee', () => {
    it('should DELETE a single payee by ID', (done) => {
      const mockResponse: ResponseDto = { success: true, data: '', rawData: '' };

      service.deletePayee(1).subscribe(response => {
        expect(response.success).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}/Delete/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });

  describe('deleteMultiplePayees', () => {
    it('should POST to delete multiple payees', (done) => {
      const mockResponse: ResponseDto = { success: true, data: '', rawData: '' };
      const ids = [1, 2, 3];

      service.deleteMultiplePayees(ids).subscribe(response => {
        expect(response.success).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}/DeleteMultiple`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(ids);
      req.flush(mockResponse);
    });
  });

  describe('payeeChanged$ observable', () => {
    it('should emit when payee is saved successfully', (done) => {
      let emitted = false;
      service.payeeChanged$.subscribe(() => { emitted = true; });

      const payeeDto: UniversalMasterSaveDto = {
        userPK: 'P099', name: 'New Payee', module: 'SUPLNT'
      };
      const mockResponse: ResponseDto = { success: true, data: '99', rawData: '' };

      service.savePayee(payeeDto).subscribe(() => {
        expect(emitted).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}/Save`);
      req.flush(mockResponse);
    });
  });

  describe('error handling', () => {
    it('should propagate HTTP errors', (done) => {
      service.getAllPayees().subscribe({
        error: (error) => {
          expect(error).toBeTruthy();
          expect(error.status).toBe(404);
          done();
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/GetAll`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
  });
});
