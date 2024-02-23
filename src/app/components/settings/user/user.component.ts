import { Component, OnInit } from '@angular/core';
import { UserDto } from '../../../models/dto/userDto';
import { HttpService } from '../../../services/http.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user.component.html',
  styleUrls: ['../../settings/main/main.component.css', './user.component.css']
})
export class UserComponent implements OnInit{
  users: UserDto[] = [];
  userSearchStr: string;
  constructor(private httpService: HttpService) { 
    this.userSearchStr = "";
  }

  ngOnInit(): void {
    this.httpService.getAllUsers().subscribe(result => {
      result.forEach(value => {
        this.users.push(value);
      });
    });
  }
}
