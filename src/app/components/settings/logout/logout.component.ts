import { Component, EventEmitter, Output } from '@angular/core';
import { UserDto } from '../../../models/dto/userDto';
import { Router } from '@angular/router';
import { HttpService } from '../../../services/http.service';
import { ResponseDto } from '../../../models/dto/responseDto';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logout.component.html',
  styleUrl: './logout.component.css'
})
export class LogoutComponent {
  logoutStatus: boolean = false;

  user: UserDto = new UserDto();

  @Output() verifyCred = new EventEmitter<boolean>();

  constructor(private router: Router, private httpService: HttpService) { }

  ngOnInit(): void {
    this.logout();    
  }

  logout(){
    this.user.token = localStorage.getItem('sessionToken') ?? '';
    this.httpService.logoutUser(this.user).subscribe((result:ResponseDto) => {
      if(result) {
        localStorage.removeItem('sessionToken');
        this.verifyCred.emit(false);
        this.logoutStatus = true;
      }

      this.router.navigate(['/']);  
    });
  }
}
