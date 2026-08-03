import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CustomerService } from './customer.service';
import { environment } from '../../environments/environment';
import { UniversalMasterDto, UniversalMasterSaveDto } from '../models/dto/universalMasterDto';
import { ResponseDto } from '../models/dto/responseDto';

describe('CustomerService', () => {
  let service: CustomerService;
  let httpMock: HttpTestingController;
  const baseUrl = environment.apiUrl + '/Customer';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(CustomerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllCustomers', () => {
    it('should GET all customers from the API', (done) => {
      const mockCustomers: UniversalMasterDto[] = [
        { sysPk: 1, userPK: 'C001', name: 'Customer 1', module: 'CUST' },
        { sysPk: 2, userPK: 'C002', name: 'Customer 2', module: 'CUST' }
      ];

      service.getAllCustomers().subscribe(customers => {
        expect(customers.length).toBe(2);
        expect(customers[0].name).toBe('Customer 1');
        expect(customers[0].userPK).toBe('C001');
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}/GetAll`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCustomers);
    });
  });

  describe('getCustomerByUserPK', () => {
    it('should GET customer by UserPK', (done) => {
      const mockCustomer: UniversalMasterDto = {
        sysPk: 1, userPK: 'C001', name: 'Customer 1', module: 'CUST'
      };

      service.getCustomerByUserPK('C001').subscribe(customer => {
        expect(customer.userPK).toBe('C001');
        expect(customer.name).toBe('Customer 1');
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}/GetByUserPK?userPK=C001`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCustomer);
    });
  });

  describe('getCustomerById', () => {
    it('should GET customer by ID', (done) => {
      const mockCustomer: UniversalMasterDto = {
        sysPk: 5, userPK: 'C005', name: 'Customer 5', module: 'CUST'
      };

      service.getCustomerById(5).subscribe(customer => {
        expect(customer.sysPk).toBe(5);
        expect(customer.name).toBe('Customer 5');
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}/GetById?id=5`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCustomer);
    });
  });

  describe('saveCustomer', () => {
    it('should POST to save a new customer', (done) => {
      const customerDto: UniversalMasterSaveDto = {
        userPK: 'C099', name: 'New Customer', module: 'CUST'
      };
      const mockResponse: ResponseDto = { success: true, data: '99', rawData: '' };

      service.saveCustomer(customerDto).subscribe(response => {
        expect(response.success).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}/Save`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(customerDto);
      req.flush(mockResponse);
    });

    it('should POST to update an existing customer', (done) => {
      const customerDto: UniversalMasterSaveDto = {
        sysPk: 1, userPK: 'C001', name: 'Updated Customer', module: 'CUST'
      };
      const mockResponse: ResponseDto = { success: true, data: '1', rawData: '' };

      service.saveCustomer(customerDto).subscribe(response => {
        expect(response.success).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}/Save`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(customerDto);
      req.flush(mockResponse);
    });
  });

  describe('deleteCustomer', () => {
    it('should DELETE a single customer by ID', (done) => {
      const mockResponse: ResponseDto = { success: true, data: '', rawData: '' };

      service.deleteCustomer(1).subscribe(response => {
        expect(response.success).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}/Delete/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });

  describe('deleteMultipleCustomers', () => {
    it('should POST to delete multiple customers', (done) => {
      const mockResponse: ResponseDto = { success: true, data: '', rawData: '' };
      const ids = [1, 2, 3];

      service.deleteMultipleCustomers(ids).subscribe(response => {
        expect(response.success).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}/DeleteMultiple`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(ids);
      req.flush(mockResponse);
    });

    it('should handle empty array', (done) => {
      const mockResponse: ResponseDto = { success: true, data: '', rawData: '' };

      service.deleteMultipleCustomers([]).subscribe(response => {
        expect(response.success).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}/DeleteMultiple`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual([]);
      req.flush(mockResponse);
    });
  });

  describe('customerChanged$ observable', () => {
    it('should emit when customer is saved successfully', (done) => {
      let emitted = false;
      service.customerChanged$.subscribe(() => { emitted = true; });

      const customerDto: UniversalMasterSaveDto = {
        userPK: 'C099', name: 'New Customer', module: 'CUST'
      };
      const mockResponse: ResponseDto = { success: true, data: '99', rawData: '' };

      service.saveCustomer(customerDto).subscribe(() => {
        expect(emitted).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}/Save`);
      req.flush(mockResponse);
    });
  });

  describe('error handling', () => {
    it('should propagate HTTP errors', (done) => {
      service.getAllCustomers().subscribe({
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
