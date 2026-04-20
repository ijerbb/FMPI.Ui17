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
export class PayeeService {
  private readonly baseUrl = environment.apiUrl + '/Payee';

  // Event emitter for payee changes
  private readonly onPayeeChanged = new Subject<void>();

  constructor(private http: HttpClient) {}

  /**
   * Get event observable for payee changes
   * Subscribe to this to reload cached data when payees change
   */
  get payeeChanged$(): Observable<void> {
    return this.onPayeeChanged.asObservable();
  }

  /**
   * Notify subscribers that payees have changed
   */
  private notifyPayeeChanged(): void {
    this.onPayeeChanged.next();
  }

  /**
   * Get all payees
   */
  getAllPayees(): Observable<UniversalMasterDto[]> {
    console.log('[PayeeService] getAllPayees - Calling API:', this.baseUrl + '/GetAll');
    return this.http.get<UniversalMasterDto[]>(this.baseUrl + '/GetAll').pipe(
      tap(response => {
        console.log('[PayeeService] getAllPayees - Success:', response);
        console.log('[PayeeService] getAllPayees - Count:', response.length);
      }),
      catchError(error => {
        console.error('[PayeeService] getAllPayees - Error:', error);
        console.error('[PayeeService] getAllPayees - URL:', this.baseUrl);
        console.error('[PayeeService] getAllPayees - Error status:', error.status);
        console.error('[PayeeService] getAllPayees - Error message:', error.message);
        console.error('[PayeeService] getAllPayees - Full error:', JSON.stringify(error, null, 2));
        if (error.error) {
          console.error('[PayeeService] getAllPayees - Server error:', error.error);
        }
        throw error;
      })
    );
  }

  /**
   * Get payee by UserPK
   */
  getPayeeByUserPK(userPK: string): Observable<UniversalMasterDto> {
    console.log(`[PayeeService] getPayeeByUserPK - UserPK: ${userPK}`);
    const params = new HttpParams().set('userPK', userPK);
    return this.http.get<UniversalMasterDto>(this.baseUrl + '/GetByUserPK', { params }).pipe(
      tap(response => {
        console.log('[PayeeService] getPayeeByUserPK - Success:', response);
      }),
      catchError(error => {
        console.error(`[PayeeService] getPayeeByUserPK - Error for UserPK ${userPK}:`, error);
        throw error;
      })
    );
  }

  /**
   * Get payee by ID
   */
  getPayeeById(id: number): Observable<UniversalMasterDto> {
    console.log(`[PayeeService] getPayeeById - ID: ${id}`);
    const params = new HttpParams().set('id', id.toString());
    return this.http.get<UniversalMasterDto>(this.baseUrl + '/GetById', { params }).pipe(
      tap(response => {
        console.log('[PayeeService] getPayeeById - Success:', response);
      }),
      catchError(error => {
        console.error(`[PayeeService] getPayeeById - Error for ID ${id}:`, error);
        throw error;
      })
    );
  }

  /**
   * Save payee (create or update)
   */
  savePayee(payee: UniversalMasterSaveDto): Observable<ResponseDto> {
    console.log('[PayeeService] savePayee - Saving payee:', payee);
    return this.http.post<ResponseDto>(this.baseUrl + '/Save', payee).pipe(
      tap(response => {
        console.log('[PayeeService] savePayee - Response:', response);
        // Notify subscribers that payees have changed
        if (response.success) {
          this.notifyPayeeChanged();
        }
      }),
      catchError(error => {
        console.error('[PayeeService] savePayee - Error:', error);
        throw error;
      })
    );
  }

  /**
   * Delete single payee
   */
  deletePayee(sysPk: number): Observable<ResponseDto> {
    console.log(`[PayeeService] deletePayee - ID: ${sysPk}`);
    return this.http.delete<ResponseDto>(this.baseUrl + '/Delete/' + sysPk).pipe(
      tap(response => {
        console.log('[PayeeService] deletePayee - Response:', response);
        // Notify subscribers that payees have changed
        if (response.success) {
          this.notifyPayeeChanged();
        }
      }),
      catchError(error => {
        console.error(`[PayeeService] deletePayee - Error for ID ${sysPk}:`, error);
        throw error;
      })
    );
  }

  /**
   * Delete multiple payees (bulk delete)
   */
  deleteMultiplePayees(ids: number[]): Observable<ResponseDto> {
    console.log(`[PayeeService] deleteMultiplePayees - IDs:`, ids);
    return this.http.post<ResponseDto>(this.baseUrl + '/DeleteMultiple', ids).pipe(
      tap(response => {
        console.log('[PayeeService] deleteMultiplePayees - Response:', response);
        // Notify subscribers that payees have changed
        if (response.success) {
          this.notifyPayeeChanged();
        }
      }),
      catchError(error => {
        console.error('[PayeeService] deleteMultiplePayees - Error:', error);
        throw error;
      })
    );
  }
}
