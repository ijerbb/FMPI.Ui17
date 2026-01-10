import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { HttpService } from '../../../services/http.service';
import { MenusDto, ModulesDto } from '../../../models/dto/menusDto';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-nav-sidemenu',
  standalone: true,
  imports: [RouterModule,CommonModule],
  templateUrl: './nav-sidemenu.component.html',
  styleUrl: './nav-sidemenu.component.css'
})
export class NavSidemenuComponent implements OnInit{
  @Output() toggleLogout = new EventEmitter();
  modulesDto: ModulesDto[] = [];
  
  constructor(private router: Router,
    private httpService: HttpService
  ) { }

  ngOnInit(): void {
    var sessionToken = localStorage.getItem('sessionToken')?.toString();
    this.httpService.getMenus(sessionToken??"").subscribe(res => {
      if(res)
      {
        this.modulesDto = JSON.parse(res.data);
      }
    });
    this.httpService
  }

  logout() {
    localStorage.removeItem("sessionToken");
    this.router.navigate(['/login']);
    this.toggleLogout.emit();
  }
}
