import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-action-menu',
  standalone: true,
  imports: [],
  templateUrl: './action-menu.component.html',
  styleUrl: './action-menu.component.css'
})
export class ActionMenuComponent implements OnInit{
  saveStatus: boolean = false; 

  @Output() onSave = new EventEmitter();
  @Input() toggleSave = new EventEmitter<boolean>; 
  
  ngOnInit(): void { 
    this.subscribeToParentEmitter(); 
  } 

  ngOnDestroy(): void { 
    this.toggleSave.unsubscribe(); 
  } 

  onSavedClicked(){
    this.onSave.emit();
  }

  subscribeToParentEmitter(): void { 
      this.toggleSave.subscribe((data: boolean) => { 
          this.saveStatus = data; 
      }); 
  } 
}
