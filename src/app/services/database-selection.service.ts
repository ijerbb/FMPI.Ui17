import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from './http.service';
import { UserDto } from '../models/dto/userDto';
import { DatabaseConfig } from '../models/dto/databaseConfig';
import { ResponseDto } from '../models/dto/responseDto';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DatabaseSelectionService {
  private currentDatabaseSubject = new BehaviorSubject<string | null>(null);
  public currentDatabase$ = this.currentDatabaseSubject.asObservable();

  constructor(
    private router: Router,
    private httpService: HttpService
  ) {
    // Load saved database on service initialization
    const savedDatabase = localStorage.getItem('selectedDatabase');
    if (savedDatabase) {
      this.currentDatabaseSubject.next(savedDatabase);
    }
  }

  getCurrentDatabase(): string | null {
    return localStorage.getItem('selectedDatabase');
  }

  setCurrentDatabase(databaseName: string): void {
    localStorage.setItem('selectedDatabase', databaseName);
    this.currentDatabaseSubject.next(databaseName);
  }

  getSessionToken(): string | null {
    return localStorage.getItem('sessionToken');
  }

  clearSession(): void {
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('selectedDatabase');
    this.currentDatabaseSubject.next(null);
  }

  switchDatabase(newDatabaseName: string): Observable<ResponseDto> {
    const token = this.getSessionToken();
    if (!token) {
      throw new Error('No active session');
    }

    const userDto = new UserDto();
    userDto.token = token;
    userDto.databaseName = newDatabaseName;

    return new Observable<ResponseDto>(observer => {
      this.httpService.switchDatabase(userDto).subscribe({
        next: (result: ResponseDto) => {
          if (result.success) {
            // Update session token and database
            localStorage.setItem('sessionToken', result.data as string);
            localStorage.setItem('selectedDatabase', newDatabaseName);
            this.currentDatabaseSubject.next(newDatabaseName);
            observer.next(result);
            observer.complete();
          } else {
            observer.error(result.data);
          }
        },
        error: (err) => {
          observer.error(err);
        }
      });
    });
  }

  logoutAndSwitch(databaseName: string): void {
    this.clearSession();
    this.setCurrentDatabase(databaseName);
    this.router.navigate(['/login']);
  }

  validateSession(): Observable<boolean> {
    return new Observable<boolean>(observer => {
      const token = this.getSessionToken();
      if (!token) {
        observer.next(false);
        observer.complete();
        return;
      }

      this.httpService.getSessionInfo(token).subscribe({
        next: (result: ResponseDto) => {
          if (result.success && result.data) {
            const sessionInfo = JSON.parse(result.data as string);
            // Update current database from session
            if (sessionInfo.databaseName) {
              this.setCurrentDatabase(sessionInfo.databaseName);
            }
            observer.next(true);
          } else {
            observer.next(false);
          }
          observer.complete();
        },
        error: (err) => {
          observer.next(false);
          observer.complete();
        }
      });
    });
  }
}
