import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, Subject } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { ResponseDto } from '../models/dto/responseDto';
import { ApplicationConfigurationDto, ApplicationConfigurationSaveDto } from '../models/dto/applicationConfigurationDto';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApplicationConfigurationService {
  private readonly baseUrl = environment.apiUrl + '/ApplicationConfiguration';

  // Event emitter for configuration changes
  private readonly onConfigurationChanged = new Subject<void>();

  constructor(private http: HttpClient) {}

  /**
   * Get event observable for configuration changes
   * Subscribe to this to reload cached data when configurations change
   */
  get configurationChanged$(): Observable<void> {
    return this.onConfigurationChanged.asObservable();
  }

  /**
   * Notify subscribers that configurations have changed
   */
  private notifyConfigurationChanged(): void {
    this.onConfigurationChanged.next();
  }

  /**
   * Get all configurations
   */
  getAllConfigurations(): Observable<ApplicationConfigurationDto[]> {
    console.log('[AppConfigService] getAllConfigurations - Calling API:', this.baseUrl + '/GetAll');
    return this.http.get<ApplicationConfigurationDto[]>(this.baseUrl + '/GetAll').pipe(
      tap(response => {
        console.log('[AppConfigService] getAllConfigurations - Success:', response);
        console.log('[AppConfigService] getAllConfigurations - Count:', response.length);
      }),
      catchError(error => {
        console.error('[AppConfigService] getAllConfigurations - Error:', error);
        console.error('[AppConfigService] getAllConfigurations - URL:', this.baseUrl);
        throw error;
      })
    );
  }

  /**
   * Get configuration by key
   */
  getConfigByKey(key: string): Observable<ApplicationConfigurationDto> {
    console.log(`[AppConfigService] getConfigByKey - Key: ${key}`);
    const params = new HttpParams().set('key', key);
    return this.http.get<ApplicationConfigurationDto>(this.baseUrl + '/GetByKey', { params }).pipe(
      tap(response => {
        console.log('[AppConfigService] getConfigByKey - Success:', response);
      }),
      catchError(error => {
        console.error(`[AppConfigService] getConfigByKey - Error for key ${key}:`, error);
        throw error;
      })
    );
  }

  /**
   * Get configuration by ID
   */
  getConfigById(id: number): Observable<ApplicationConfigurationDto> {
    console.log(`[AppConfigService] getConfigById - ID: ${id}`);
    const params = new HttpParams().set('id', id.toString());
    return this.http.get<ApplicationConfigurationDto>(this.baseUrl + '/GetById', { params }).pipe(
      tap(response => {
        console.log('[AppConfigService] getConfigById - Success:', response);
      }),
      catchError(error => {
        console.error(`[AppConfigService] getConfigById - Error for ID ${id}:`, error);
        throw error;
      })
    );
  }

  /**
   * Save configuration (create or update)
   */
  saveConfig(config: ApplicationConfigurationSaveDto): Observable<ResponseDto> {
    console.log('[AppConfigService] saveConfig - Saving config:', config);
    return this.http.post<ResponseDto>(this.baseUrl + '/Save', config).pipe(
      tap(response => {
        console.log('[AppConfigService] saveConfig - Response:', response);
        // Notify subscribers that configurations have changed
        if (response.success) {
          this.notifyConfigurationChanged();
        }
      }),
      catchError(error => {
        console.error('[AppConfigService] saveConfig - Error:', error);
        throw error;
      })
    );
  }

  /**
   * Delete single configuration
   */
  deleteConfig(sysPk: number): Observable<ResponseDto> {
    console.log(`[AppConfigService] deleteConfig - ID: ${sysPk}`);
    return this.http.delete<ResponseDto>(this.baseUrl + '/Delete/' + sysPk).pipe(
      tap(response => {
        console.log('[AppConfigService] deleteConfig - Response:', response);
        // Notify subscribers that configurations have changed
        if (response.success) {
          this.notifyConfigurationChanged();
        }
      }),
      catchError(error => {
        console.error(`[AppConfigService] deleteConfig - Error for ID ${sysPk}:`, error);
        throw error;
      })
    );
  }

  /**
   * Delete multiple configurations (bulk delete)
   */
  deleteMultipleConfigurations(ids: number[]): Observable<ResponseDto> {
    console.log(`[AppConfigService] deleteMultipleConfigurations - IDs:`, ids);
    return this.http.post<ResponseDto>(this.baseUrl + '/DeleteMultiple', ids).pipe(
      tap(response => {
        console.log('[AppConfigService] deleteMultipleConfigurations - Response:', response);
        // Notify subscribers that configurations have changed
        if (response.success) {
          this.notifyConfigurationChanged();
        }
      }),
      catchError(error => {
        console.error('[AppConfigService] deleteMultipleConfigurations - Error:', error);
        throw error;
      })
    );
  }

  /**
   * Validate JSON string
   */
  validateJson(json: string): Observable<boolean> {
    console.log(`[AppConfigService] validateJson - JSON length: ${json?.length ?? 0}`);
    const params = new HttpParams().set('json', json);
    return this.http.get<ResponseDto>(this.baseUrl + '/ValidateJson', { params }).pipe(
      map(response => (response as any).success),
      tap(result => {
        console.log('[AppConfigService] validateJson - Valid:', result);
      }),
      catchError(error => {
        console.error('[AppConfigService] validateJson - Error:', error);
        return of(false);
      })
    );
  }
}
