import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DatabaseSelectionService } from '../../../services/database-selection.service';
import { HttpService } from '../../../services/http.service';
import { DatabaseConfig } from '../../../models/dto/databaseConfig';
import { ResponseDto } from '../../../models/dto/responseDto';
import { UserDto } from '../../../models/dto/userDto';
import { catchError, timeout } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { StateService } from '../../../services/state.service';

@Component({
  selector: 'app-database-switcher',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './database-switcher.component.html',
  styleUrl: './database-switcher.component.css'
})
export class DatabaseSwitcherComponent implements OnInit {
  databases: DatabaseConfig[] = [];
  currentDatabase: string = '';
  selectedDatabase: string = '';
  showSwitcher = false;
  isLoading = false;
  errorMsg = '';

  constructor(
    private dbService: DatabaseSelectionService,
    private httpService: HttpService,
    private router: Router,
    private stateService: StateService
  ) {}

  ngOnInit(): void {
    this.loadCurrentDatabase();
    this.loadDatabases();
  }

  loadCurrentDatabase(): void {
    const db = this.dbService.getCurrentDatabase();
    if (db) {
      this.currentDatabase = db;
      this.selectedDatabase = db;
    }
  }

  loadDatabases(): void {
    this.httpService.getAvailableDatabases().subscribe({
      next: (result: ResponseDto) => {
        if (result.success && result.data) {
          this.databases = JSON.parse(result.data as string);
        }
      },
      error: (err) => {
        console.error('Failed to load databases', err);
      }
    });
  }

  toggleSwitcher(): void {
    this.showSwitcher = !this.showSwitcher;
    this.errorMsg = '';
  }

  switchDatabase(): void {
    if (!this.selectedDatabase || this.selectedDatabase === this.currentDatabase) {
      this.showSwitcher = false;
      return;
    }

    this.isLoading = true;
    this.errorMsg = '';

    // Switch to the new database using the backend API
    const userDto = new UserDto();
    userDto.token = this.dbService.getSessionToken() || '';
    userDto.databaseName = this.selectedDatabase;

    console.log('Switching database from', this.currentDatabase, 'to', this.selectedDatabase);
    console.log('Using token:', userDto.token ? userDto.token.substring(0, 20) + '...' : 'none');
    console.log('API URL:', environment.apiUrl + '/Settings/SwitchDatabase');

    this.httpService.switchDatabase(userDto).pipe(
      timeout(10000), // 10 second timeout
      catchError((err) => {
        console.error('Switch database caught error:', err);
        return throwError(() => err);
      })
    ).subscribe({
      next: (result: ResponseDto) => {
        console.log('Switch database response:', result);
        if (result.success) {
          // Clear cached state to force fresh data load
          this.stateService.state$.next(null);
          this.stateService.search$.next(null);
          
          // Update session token and database
          localStorage.setItem('sessionToken', result.data as string);
          this.dbService.setCurrentDatabase(this.selectedDatabase);
          
          console.log('Successfully switched to', this.selectedDatabase);
          
          // Force full page reload to ensure all components reinitialize with new database
          window.location.href = '/dashboard';
        } else {
          console.error('Switch database failed:', result.data);
          this.errorMsg = result.data as string || 'Failed to switch database';
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error('Switch database error:', err);
        this.errorMsg = 'Failed to switch database: ' + (err.message || 'Unknown error');
        this.isLoading = false;
      }
    });
  }

  cancelSwitch(): void {
    this.selectedDatabase = this.currentDatabase;
    this.showSwitcher = false;
    this.errorMsg = '';
  }
}
