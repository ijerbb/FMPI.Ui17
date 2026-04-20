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
export class SupplierService {
  private readonly baseUrl = environment.apiUrl + '/Supplier';

  // Event emitter for supplier changes
  private readonly onSupplierChanged = new Subject<void>();

  constructor(private http: HttpClient) {}

  /**
   * Get event observable for supplier changes
   * Subscribe to this to reload cached data when suppliers change
   */
  get supplierChanged$(): Observable<void> {
    return this.onSupplierChanged.asObservable();
  }

  /**
   * Notify subscribers that suppliers have changed
   */
  private notifySupplierChanged(): void {
    this.onSupplierChanged.next();
  }

  /**
   * Get all suppliers
   */
  getAllSuppliers(): Observable<UniversalMasterDto[]> {
    console.log('[SupplierService] getAllSuppliers - Calling API:', this.baseUrl + '/GetAll');
    return this.http.get<UniversalMasterDto[]>(this.baseUrl + '/GetAll').pipe(
      tap(response => {
        console.log('[SupplierService] getAllSuppliers - Success:', response);
        console.log('[SupplierService] getAllSuppliers - Count:', response.length);
      }),
      catchError(error => {
        console.error('[SupplierService] getAllSuppliers - Error:', error);
        console.error('[SupplierService] getAllSuppliers - URL:', this.baseUrl);
        console.error('[SupplierService] getAllSuppliers - Error status:', error.status);
        console.error('[SupplierService] getAllSuppliers - Error message:', error.message);
        console.error('[SupplierService] getAllSuppliers - Full error:', JSON.stringify(error, null, 2));
        if (error.error) {
          console.error('[SupplierService] getAllSuppliers - Server error:', error.error);
        }
        throw error;
      })
    );
  }

  /**
   * Get supplier by UserPK
   */
  getSupplierByUserPK(userPK: string): Observable<UniversalMasterDto> {
    console.log(`[SupplierService] getSupplierByUserPK - UserPK: ${userPK}`);
    const params = new HttpParams().set('userPK', userPK);
    return this.http.get<UniversalMasterDto>(this.baseUrl + '/GetByUserPK', { params }).pipe(
      tap(response => {
        console.log('[SupplierService] getSupplierByUserPK - Success:', response);
      }),
      catchError(error => {
        console.error(`[SupplierService] getSupplierByUserPK - Error for UserPK ${userPK}:`, error);
        throw error;
      })
    );
  }

  /**
   * Get supplier by ID
   */
  getSupplierById(id: number): Observable<UniversalMasterDto> {
    console.log(`[SupplierService] getSupplierById - ID: ${id}`);
    const params = new HttpParams().set('id', id.toString());
    return this.http.get<UniversalMasterDto>(this.baseUrl + '/GetById', { params }).pipe(
      tap(response => {
        console.log('[SupplierService] getSupplierById - Success:', response);
      }),
      catchError(error => {
        console.error(`[SupplierService] getSupplierById - Error for ID ${id}:`, error);
        throw error;
      })
    );
  }

  /**
   * Save supplier (create or update)
   */
  saveSupplier(supplier: UniversalMasterSaveDto): Observable<ResponseDto> {
    console.log('[SupplierService] saveSupplier - Saving supplier:', supplier);
    return this.http.post<ResponseDto>(this.baseUrl + '/Save', supplier).pipe(
      tap(response => {
        console.log('[SupplierService] saveSupplier - Response:', response);
        // Notify subscribers that suppliers have changed
        if (response.success) {
          this.notifySupplierChanged();
        }
      }),
      catchError(error => {
        console.error('[SupplierService] saveSupplier - Error:', error);
        throw error;
      })
    );
  }

  /**
   * Delete single supplier
   */
  deleteSupplier(sysPk: number): Observable<ResponseDto> {
    console.log(`[SupplierService] deleteSupplier - ID: ${sysPk}`);
    return this.http.delete<ResponseDto>(this.baseUrl + '/Delete/' + sysPk).pipe(
      tap(response => {
        console.log('[SupplierService] deleteSupplier - Response:', response);
        // Notify subscribers that suppliers have changed
        if (response.success) {
          this.notifySupplierChanged();
        }
      }),
      catchError(error => {
        console.error(`[SupplierService] deleteSupplier - Error for ID ${sysPk}:`, error);
        throw error;
      })
    );
  }

  /**
   * Delete multiple suppliers (bulk delete)
   */
  deleteMultipleSuppliers(ids: number[]): Observable<ResponseDto> {
    console.log(`[SupplierService] deleteMultipleSuppliers - IDs:`, ids);
    return this.http.post<ResponseDto>(this.baseUrl + '/DeleteMultiple', ids).pipe(
      tap(response => {
        console.log('[SupplierService] deleteMultipleSuppliers - Response:', response);
        // Notify subscribers that suppliers have changed
        if (response.success) {
          this.notifySupplierChanged();
        }
      }),
      catchError(error => {
        console.error('[SupplierService] deleteMultipleSuppliers - Error:', error);
        throw error;
      })
    );
  }
}
