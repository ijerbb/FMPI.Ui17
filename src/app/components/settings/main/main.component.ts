import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NavMenuComponent } from "../nav-menu/nav-menu.component";
import { AlertService } from '../../../services/alert.service';

@Component({
    selector: 'app-main',
    standalone: true,
    templateUrl: './main.component.html',
    styleUrl: './main.component.css',
    imports: [CommonModule, RouterModule, NavMenuComponent]
})
export class MainComponent {
  @Input() mainMenuToggled: boolean = false; 
  @Output() toggleMainMenuToggled = new EventEmitter();
  
  successAlert:boolean;
  errorAlert: boolean;
  customErrorAlert: string;

  constructor(alertService:AlertService) {
    this.successAlert = false;
    alertService.successAlert.subscribe((status:boolean)=>{
      this.successAlert = status;
      this.setSuccessAlertTimeOut();
    });

    this.errorAlert = false;
    alertService.errorAlert.subscribe((status: boolean) => {
      this.errorAlert = status;
      this.setErrorAlertTimeOut();
    });

    this.customErrorAlert = "";
    alertService.customErrorAlert.subscribe((message: string) => {
      this.customErrorAlert = message;
      this.setcustomErrorAlertTimeOut();
    });
  }

  ngOnInit(): void {
  }

  onMainMenuToggle(){
    this.mainMenuToggled = !this.mainMenuToggled;
    this.toggleMainMenuToggled.emit();
  }

  setSuccessAlertTimeOut(){
    setTimeout(() => {
      this.successAlert = false;
    }, 3000);
  }

  setErrorAlertTimeOut(){
    setTimeout(() => {
      this.errorAlert = false;
    }, 3000);
  }

  setcustomErrorAlertTimeOut(){
    setTimeout(() => {
      this.customErrorAlert = "";
    }, 3000);
  }
}
