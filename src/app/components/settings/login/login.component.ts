import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { UserDto } from '../../../models/dto/userDto';
import { HttpService } from '../../../services/http.service';
import { ResponseDto } from '../../../models/dto/responseDto';
import { FormsModule } from '@angular/forms';
import { DatabaseConfig } from '../../../models/dto/databaseConfig';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  userid: string = "";
  userpassword: string = "";
  errorMsg: string = "";
  selectedDatabase: string = "";
  databases: DatabaseConfig[] = [];

  user: UserDto = new UserDto();

  @Output() verifyCred = new EventEmitter<boolean>();

  constructor(private router: Router, private httpService: HttpService) { }

  ngOnInit(): void {
    this.loadDatabases();
  }

  loadDatabases(): void {
    console.log('Loading available databases...');
    this.httpService.getAvailableDatabases().subscribe({
      next: (result: ResponseDto) => {
        console.log('Database load result:', result);
        if (result.success && result.data) {
          this.databases = JSON.parse(result.data as string);
          console.log('Parsed databases:', this.databases);
          // Select first database by default
          if (this.databases.length > 0) {
            this.selectedDatabase = this.databases[0].DatabaseName;
            this.user.databaseName = this.selectedDatabase;
            console.log('Selected database:', this.selectedDatabase);
          } else {
            console.warn('No databases available');
            this.errorMsg = 'No databases configured. Please contact administrator.';
          }
        } else {
          console.error('Failed to load databases:', result.data);
          this.errorMsg = 'Failed to load databases: ' + result.data;
        }
      },
      error: (err) => {
        console.error('HTTP error loading databases:', err);
        this.errorMsg = 'Cannot connect to API server. Please check connection.';
      }
    });
  }

  onDatabaseChange(): void {
    this.user.databaseName = this.selectedDatabase;
  }

  verify():void{
    if (!this.selectedDatabase) {
      this.errorMsg = "Please select a database";
      return;
    }

    this.user.databaseName = this.selectedDatabase;
    
    this.httpService.verifyLogin(this.user).subscribe((result:ResponseDto) => {
      if(result.success){
        localStorage.setItem('sessionToken', result.data as string);
        localStorage.setItem('selectedDatabase', this.selectedDatabase);
        this.verifyCred.emit(true);
        this.router.navigate(['/']);
      } else {
        this.errorMsg = "Invalid User Id / Password";
      }
    });
  }

  onKeyPressEvent(event: KeyboardEvent){
    if(event.key === 'Enter'){
      this.verify();
    }
  }
}
