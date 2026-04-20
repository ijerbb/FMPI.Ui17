import { Component, OnInit } from '@angular/core';
import { UserDto } from '../../../models/dto/userDto';
import { HttpService } from '../../../services/http.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PaginationComponent } from '../../../components/shared/pagination/pagination.component';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, RouterModule, PaginationComponent],
  templateUrl: './user.component.html',
  styleUrls: ['../../settings/main/main.component.css', './user.component.css']
})
export class UserComponent implements OnInit{
  users: UserDto[] = [];
  paginatedUsers: UserDto[] = [];
  userSearchStr: string;
  
  // Pagination properties
  pageNum: number = 1;
  pageSize: number = 10;
  totalRecords: number = 0;

  constructor(private httpService: HttpService) {
    this.userSearchStr = "";
  }

  ngOnInit(): void {
    this.httpService.getAllUsers().subscribe(result => {
      this.users = result;
      this.totalRecords = result.length;
      this.updatePaginatedUsers();
    });
  }

  /**
   * Update paginated users based on current page
   */
  updatePaginatedUsers(): void {
    const start = (this.pageNum - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedUsers = this.users.slice(start, end);
  }

  /**
   * Handle page change event
   */
  onPageChange(page: number): void {
    this.pageNum = page;
    this.updatePaginatedUsers();
  }
}
