import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-nav-sidemenu',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './nav-sidemenu.component.html',
  styleUrl: './nav-sidemenu.component.css'
})
export class NavSidemenuComponent implements OnInit{
  @Output() toggleLogout = new EventEmitter();
  
  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  logout() {
    localStorage.removeItem("sessionToken");
    this.router.navigate(['/login']);
    this.toggleLogout.emit();
  }
}
