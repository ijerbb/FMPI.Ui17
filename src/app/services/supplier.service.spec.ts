import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SupplierService } from './supplier.service';
import { environment } from '../../environments/environment';
import { UniversalMasterDto, UniversalMasterSaveDto } from '../models/dto/universalMasterDto';
import { ResponseDto } from '../models/dto/responseDto';

describe('SupplierService', () => {
  let service: SupplierService;
  let httpMock: HttpTestingController;
  const baseUrl = environment.apiUrl + '/Supplier';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(SupplierService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllSuppliers', () => {
    it('should GET all suppliers from the API', (done) => {
      const mockSuppliers: UniversalMasterDto[] = [
        { sysPk: 1, userPK: 'S001', name: 'Supplier 1', module: 'SUPL' },
        { sysPk: 2, userPK: 'S002', name: 'Supplier 2', module: 'SUPL' }
      ];

      service.getAllSuppliers().subscribe(suppliers => {
        expect(suppliers.length).toBe(2);
        expect(suppliers[0].name).toBe('Supplier 1');
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}/GetAll`);
      expect(req.request.method).toBe('GET');
      req.flush(mockSuppliers);
    });
  });

  describe('getSupplierByUserPK', () => {
    it('should GET supplier by UserPK', (done) => {
      const mockSupplier: UniversalMasterDto = {
        sysPk: 1, userPK: 'S001', name: 'Supplier 1', module: 'SUPL'
      };

      service.getSupplierByUserPK('S001').subscribe(supplier => {
        expect(supplier.userPK).toBe('S001');
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}/GetByUserPK?userPK=S001`);
      expect(req.request.method).toBe('GET');
      req.flush(mockSupplier);
    });
  });

  describe('getSupplierById', () => {
    it('should GET supplier by ID', (done) => {
      const mockSupplier: UniversalMasterDto = {
        sysPk: 3, userPK: 'S003', name: 'Supplier 3', module: 'SUPL'
      };

      service.getSupplierById(3).subscribe(supplier => {
        expect(supplier.sysPk).toBe(3);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}/GetById?id=3`);
      expect(req.request.method).toBe('GET');
      req.flush(mockSupplier);
    });
  });

  describe('saveSupplier', () => {
    it('should POST to save a new supplier', (done) => {
      const supplierDto: UniversalMasterSaveDto = {
        userPK: 'S099', name: 'New Supplier', module: 'SUPL'
      };
      const mockResponse: ResponseDto = { success: true, data: '99', rawData: '' };

      service.saveSupplier(supplierDto).subscribe(response => {
        expect(response.success).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}/Save`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(supplierDto);
      req.flush(mockResponse);
    });
  });

  describe('deleteSupplier', () => {
    it('should DELETE a single supplier by ID', (done) => {
      const mockResponse: ResponseDto = { success: true, data: '', rawData: '' };

      service.deleteSupplier(1).subscribe(response => {
        expect(response.success).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}/Delete/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });

  describe('deleteMultipleSuppliers', () => {
    it('should POST to delete multiple suppliers', (done) => {
      const mockResponse: ResponseDto = { success: true, data: '', rawData: '' };
      const ids = [1, 2, 3];

      service.deleteMultipleSuppliers(ids).subscribe(response => {
        expect(response.success).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}/DeleteMultiple`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(ids);
      req.flush(mockResponse);
    });
  });

  describe('supplierChanged$ observable', () => {
    it('should emit when supplier is saved successfully', (done) => {
      let emitted = false;
      service.supplierChanged$.subscribe(() => { emitted = true; });

      const supplierDto: UniversalMasterSaveDto = {
        userPK: 'S099', name: 'New Supplier', module: 'SUPL'
      };
      const mockResponse: ResponseDto = { success: true, data: '99', rawData: '' };

      service.saveSupplier(supplierDto).subscribe(() => {
        expect(emitted).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}/Save`);
      req.flush(mockResponse);
    });
  });

  describe('error handling', () => {
    it('should propagate HTTP errors', (done) => {
      service.getAllSuppliers().subscribe({
        error: (error) => {
          expect(error).toBeTruthy();
          expect(error.status).toBe(500);
          done();
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/GetAll`);
      req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });
});
