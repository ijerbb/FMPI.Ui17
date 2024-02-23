import { Component, EventEmitter, OnInit } from '@angular/core';
import { UserDto } from '../../../models/dto/userDto';
import { HttpService } from '../../../services/http.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AlertService } from '../../../services/alert.service';
import { ActionMenuComponent } from "../action-menu/action-menu.component";
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-userdetail',
    standalone: true,
    templateUrl: './userdetail.component.html',
    styleUrls: ['../../settings/main/main.component.css', './userdetail.component.css'],
    imports: [FormsModule, RouterModule, ActionMenuComponent]
})
export class UserDetailComponent implements OnInit {
  user: UserDto = new UserDto();

  toggleSave = new EventEmitter<boolean>(); 

  constructor(private httpService: HttpService, private route: ActivatedRoute, private alertService:AlertService) { }

  ngOnInit(): void {
    const id = parseInt(this.route.snapshot.paramMap.get('id')!,10);
    
    this.httpService.getUser(id).subscribe(result => {
      this.user = result;
      this.user.password = this.makeRandom(20);
      this.user.confirmpassword = this.makeRandom(20);
    });
  }

  validate(){
    this.verifyPasswordMatch();
  }

  makeRandom(lengthOfCode: number) {
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890,./;'[]\=-)(*&^%$#@!~`";
    let text = "";
    for (let i = 0; i < lengthOfCode; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
      return text;
  }

  verifyPasswordMatch(){
    if(this.user.password == this.user.confirmpassword){
      this.toggleSave.emit(true);
    }
  }

  onSave(){
    if(this.user.password == this.user.confirmpassword){
      this.httpService.patchUser(this.user).subscribe(result => {
        this.alertService.setSuccessAlert();
      });
    } else {
      // Throw validation Error
      this.alertService.setCustomErrorAlert("Password mismatch");
    }
  }
}
