import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { HttpService } from '../../../services/http.service';
import { MenusDto, ModulesDto } from '../../../models/dto/menusDto';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatabaseSelectionService } from '../../../services/database-selection.service';
import { DatabaseConfig } from '../../../models/dto/databaseConfig';
import { ResponseDto } from '../../../models/dto/responseDto';
import { UserDto } from '../../../models/dto/userDto';
import { catchError, timeout } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { StateService } from '../../../services/state.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-nav-sidemenu',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './nav-sidemenu.component.html',
  styleUrl: './nav-sidemenu.component.css'
})
export class NavSidemenuComponent implements OnInit{
  @Output() toggleLogout = new EventEmitter();
  modulesDto: ModulesDto[] = [];

  // Track expanded modules
  expandedModules: Set<number> = new Set();

  // User section
  username: string = 'User';
  showUserMenu: boolean = false;
  
  // Database section
  currentDatabase: string = '';
  selectedDatabase: string = '';
  showDatabaseMenu: boolean = false;
  isLoading: boolean = false;
  errorMsg: string = '';
  databases: DatabaseConfig[] = [];

  constructor(
    private router: Router,
    private httpService: HttpService,
    private dbService: DatabaseSelectionService,
    private stateService: StateService
  ) {}

  ngOnInit(): void {
    this.loadUsername();
    this.loadCurrentDatabase();
    this.loadDatabases();
    
    var sessionToken = localStorage.getItem('sessionToken')?.toString();
    this.httpService.getMenus(sessionToken??"").subscribe(res => {
      if(res) {
        this.modulesDto = JSON.parse(res.data);
      }
    });
  }

  loadUsername(): void {
    const token = localStorage.getItem('sessionToken');
    if (token) {
      this.httpService.getSessionInfo(token).subscribe({
        next: (result: ResponseDto) => {
          if (result.success && result.data) {
            const sessionInfo = JSON.parse(result.data as string);
            this.username = sessionInfo.userCode || 'User';
          }
        },
        error: () => {
          this.username = 'User';
        }
      });
    }
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

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
    this.showDatabaseMenu = false;
  }

  toggleDatabaseMenu() {
    this.showDatabaseMenu = !this.showDatabaseMenu;
    this.showUserMenu = false;
  }

  toggleModule(index: number) {
    if (this.expandedModules.has(index)) {
      this.expandedModules.delete(index);
    } else {
      this.expandedModules.add(index);
    }
  }

  isModuleExpanded(index: number): boolean {
    return this.expandedModules.has(index);
  }

  logout() {
    localStorage.removeItem("sessionToken");
    this.showUserMenu = false;
    this.showDatabaseMenu = false;
    this.router.navigate(['/login']);
    this.toggleLogout.emit();
  }

  switchDatabase(): void {
    if (!this.selectedDatabase || this.selectedDatabase === this.currentDatabase) {
      this.showDatabaseMenu = false;
      return;
    }

    this.isLoading = true;
    this.errorMsg = '';

    const userDto = new UserDto();
    userDto.token = this.dbService.getSessionToken() || '';
    userDto.databaseName = this.selectedDatabase;

    this.httpService.switchDatabase(userDto).pipe(
      timeout(10000),
      catchError((err) => {
        console.error('Switch database caught error:', err);
        return throwError(() => err);
      })
    ).subscribe({
      next: (result: ResponseDto) => {
        if (result.success) {
          this.stateService.state$.next(null);
          this.stateService.search$.next(null);
          localStorage.setItem('sessionToken', result.data as string);
          this.dbService.setCurrentDatabase(this.selectedDatabase);
          window.location.href = '/dashboard';
        } else {
          this.errorMsg = result.data as string || 'Failed to switch database';
          this.isLoading = false;
        }
      },
      error: (err) => {
        this.errorMsg = 'Failed to switch database: ' + (err.message || 'Unknown error');
        this.isLoading = false;
      }
    });
  }

  cancelSwitch(): void {
    this.selectedDatabase = this.currentDatabase;
    this.showDatabaseMenu = false;
    this.errorMsg = '';
  }
}
