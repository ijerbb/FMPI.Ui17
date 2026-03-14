import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { Subject } from 'rxjs/internal/Subject';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  successAlert: Observable<boolean>;
  errorAlert: Observable<boolean>;

  customErrorAlert: Observable<string>;
  customSuccessAlert: Observable<string>;

  private successAlertStatus = new Subject<boolean>();
  private errorAlertStatus = new Subject<boolean>();
  private customErrorAlertStatus = new Subject<string>();
  private customSuccessAlertStatus = new Subject<string>();

  constructor() {
    this.successAlertStatus = new Subject<boolean>();
    this.successAlert = this.successAlertStatus.asObservable();

    this.errorAlertStatus = new Subject<boolean>();
    this.errorAlert = this.errorAlertStatus.asObservable();

    this.customErrorAlertStatus = new Subject<string>();
    this.customErrorAlert = this.customErrorAlertStatus.asObservable();

    this.customSuccessAlertStatus = new Subject<string>();
    this.customSuccessAlert = this.customSuccessAlertStatus.asObservable();
  }

  setSuccessAlert(){
    this.successAlertStatus.next(true);
  }
  
  setErrorAlert(){
    this.errorAlertStatus.next(true);
  }

  setCustomErrorAlert(message:string){
    this.customErrorAlertStatus.next(message);
  }

  setCustomSuccessAlert(message:string){
    this.customSuccessAlertStatus.next(message);
  }
}
