import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { UserDto } from '../../../models/dto/userDto';
import { HttpService } from '../../../services/http.service';
import { ResponseDto } from '../../../models/dto/responseDto';
import { FormsModule } from '@angular/forms';

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

  user: UserDto = new UserDto();

  @Output() verifyCred = new EventEmitter<boolean>();

  constructor(private router: Router, private httpService: HttpService) { }

  ngOnInit(): void {
  }

  verify():void{
    this.httpService.verifyLogin(this.user).subscribe((result:ResponseDto) => {
      if(result.success){
        localStorage.setItem('sessionToken', result.data);
        this.verifyCred.emit(true);
        this.router.navigate(['/']);  
      } else {
        this.errorMsg = "Invalid User Id / Password";
      }
    });
  }

  onKeyPressEvent(event: KeyboardEvent){
    // this.verify();
  }
}
