import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, Subject } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { ResponseDto } from '../models/dto/responseDto';
import { UniversalMasterDto, UniversalMasterSaveDto } from '../models/dto/universalMasterDto';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private readonly baseUrl = environment.apiUrl + '/Customer';

  // Event emitter for customer changes
  private readonly onCustomerChanged = new Subject<void>();

  constructor(private http: HttpClient) {}

  /**
   * Get event observable for customer changes
   * Subscribe to this to reload cached data when customers change
   */
  get customerChanged$(): Observable<void> {
    return this.onCustomerChanged.asObservable();
  }

  /**
   * Notify subscribers that customers have changed
   */
  private notifyCustomerChanged(): void {
    this.onCustomerChanged.next();
  }

  /**
   * Get all customers
   */
  getAllCustomers(): Observable<UniversalMasterDto[]> {
    console.log('[CustomerService] getAllCustomers - Calling API:', this.baseUrl + '/GetAll');
    return this.http.get<UniversalMasterDto[]>(this.baseUrl + '/GetAll').pipe(
      tap(response => {
        console.log('[CustomerService] getAllCustomers - Success:', response);
        console.log('[CustomerService] getAllCustomers - Count:', response.length);
      }),
      catchError(error => {
        console.error('[CustomerService] getAllCustomers - Error:', error);
        console.error('[CustomerService] getAllCustomers - URL:', this.baseUrl);
        console.error('[CustomerService] getAllCustomers - Error status:', error.status);
        console.error('[CustomerService] getAllCustomers - Error message:', error.message);
        console.error('[CustomerService] getAllCustomers - Full error:', JSON.stringify(error, null, 2));
        if (error.error) {
          console.error('[CustomerService] getAllCustomers - Server error:', error.error);
        }
        throw error;
      })
    );
  }

  /**
   * Get customer by UserPK
   */
  getCustomerByUserPK(userPK: string): Observable<UniversalMasterDto> {
    console.log(`[CustomerService] getCustomerByUserPK - UserPK: ${userPK}`);
    const params = new HttpParams().set('userPK', userPK);
    return this.http.get<UniversalMasterDto>(this.baseUrl + '/GetByUserPK', { params }).pipe(
      tap(response => {
        console.log('[CustomerService] getCustomerByUserPK - Success:', response);
      }),
      catchError(error => {
        console.error(`[CustomerService] getCustomerByUserPK - Error for UserPK ${userPK}:`, error);
        throw error;
      })
    );
  }

  /**
   * Get customer by ID
   */
  getCustomerById(id: number): Observable<UniversalMasterDto> {
    console.log(`[CustomerService] getCustomerById - ID: ${id}`);
    const params = new HttpParams().set('id', id.toString());
    return this.http.get<UniversalMasterDto>(this.baseUrl + '/GetById', { params }).pipe(
      tap(response => {
        console.log('[CustomerService] getCustomerById - Success:', response);
      }),
      catchError(error => {
        console.error(`[CustomerService] getCustomerById - Error for ID ${id}:`, error);
        throw error;
      })
    );
  }

  /**
   * Save customer (create or update)
   */
  saveCustomer(customer: UniversalMasterSaveDto): Observable<ResponseDto> {
    console.log('[CustomerService] saveCustomer - Saving customer:', customer);
    return this.http.post<ResponseDto>(this.baseUrl + '/Save', customer).pipe(
      tap(response => {
        console.log('[CustomerService] saveCustomer - Response:', response);
        // Notify subscribers that customers have changed
        if (response.success) {
          this.notifyCustomerChanged();
        }
      }),
      catchError(error => {
        console.error('[CustomerService] saveCustomer - Error:', error);
        throw error;
      })
    );
  }

  /**
   * Delete single customer
   */
  deleteCustomer(sysPk: number): Observable<ResponseDto> {
    console.log(`[CustomerService] deleteCustomer - ID: ${sysPk}`);
    return this.http.delete<ResponseDto>(this.baseUrl + '/Delete/' + sysPk).pipe(
      tap(response => {
        console.log('[CustomerService] deleteCustomer - Response:', response);
        // Notify subscribers that customers have changed
        if (response.success) {
          this.notifyCustomerChanged();
        }
      }),
      catchError(error => {
        console.error(`[CustomerService] deleteCustomer - Error for ID ${sysPk}:`, error);
        throw error;
      })
    );
  }

  /**
   * Delete multiple customers (bulk delete)
   */
  deleteMultipleCustomers(ids: number[]): Observable<ResponseDto> {
    console.log(`[CustomerService] deleteMultipleCustomers - IDs:`, ids);
    return this.http.post<ResponseDto>(this.baseUrl + '/DeleteMultiple', ids).pipe(
      tap(response => {
        console.log('[CustomerService] deleteMultipleCustomers - Response:', response);
        // Notify subscribers that customers have changed
        if (response.success) {
          this.notifyCustomerChanged();
        }
      }),
      catchError(error => {
        console.error('[CustomerService] deleteMultipleCustomers - Error:', error);
        throw error;
      })
    );
  }
}
