import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { LoginComponent } from "./components/settings/login/login.component";
import { MainComponent } from "./components/settings/main/main.component";
import { NavSidemenuComponent } from "./components/settings/nav-sidemenu/nav-sidemenu.component";

@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
    imports: [CommonModule, RouterOutlet, LoginComponent, MainComponent, NavSidemenuComponent]
})
export class AppComponent {
  title = 'UI';
  loginStatus: boolean = false;
  menuToggled: boolean = false;

  constructor(private router: Router){
    var sessionToken = localStorage.getItem('sessionToken');
    if(!sessionToken){
      this.router.navigate(['/']);
    } else {
      this.loginStatus = true;
    }
  }

  onNgInit(){
  }

  onVerifyCred(status: boolean){
    this.loginStatus = status;
  }

  onMenuToggled() {
    this.menuToggled = !this.menuToggled;
  }

  onLogoutToggled() {
    this.loginStatus = false;
  }
}
