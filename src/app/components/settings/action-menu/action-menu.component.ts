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
  printStatus: boolean = false;

  @Output() onSave = new EventEmitter();
  @Output() onPrint = new EventEmitter();

  @Input() toggleSave = new EventEmitter<boolean>; 
  @Input() togglePrint = new EventEmitter<boolean>;
  
  ngOnInit(): void { 
    this.subscribeToParentEmitter(); 
  } 

  ngOnDestroy(): void { 
    this.toggleSave.unsubscribe(); 
  } 

  onSavedClicked(){
    this.onSave.emit();
  }

  onPrintClicked(){
    this.onPrint.emit();
  }

  subscribeToParentEmitter(): void { 
      this.toggleSave.subscribe((data: boolean) => { 
          this.saveStatus = data; 
      }); 
      this.togglePrint.subscribe((data: boolean) => {
        this.printStatus = data;
      })
  } 
}
