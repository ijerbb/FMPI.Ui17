import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nav-menu.component.html',
  styleUrl: './nav-menu.component.css'
})
export class NavMenuComponent {
  @Output() toggleMenu = new EventEmitter();
  @Output() toggleLogout = new EventEmitter();
  
  toggled: boolean = false;

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  toggle() {
    this.toggleMenu.emit();
    this.toggled = !this.toggled;
  }

  logout() {
    localStorage.removeItem("sessionToken");
    this.router.navigate(['/login']);
    this.toggleLogout.emit();
  }
}
