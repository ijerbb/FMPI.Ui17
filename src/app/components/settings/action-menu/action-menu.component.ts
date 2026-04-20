import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-action-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './action-menu.component.html',
  styleUrl: './action-menu.component.css'
})
export class ActionMenuComponent implements OnInit{
  saveStatus: boolean = false;
  printStatus: boolean = false;
  editStatus: boolean = false;
  addStatus: boolean = false;

  @Output() onSave = new EventEmitter();
  @Output() onPrint = new EventEmitter();
  @Output() onEdit = new EventEmitter();
  @Output() onAdd = new EventEmitter();

  @Input() toggleSave: boolean = false;
  @Input() togglePrint: boolean = false;
  @Input() toggleEdit: boolean = false;
  @Input() toggleAdd: boolean = false;

  ngOnInit(): void {
    // Initialize statuses from inputs
    this.saveStatus = this.toggleSave;
    this.printStatus = this.togglePrint;
    this.editStatus = this.toggleEdit;
    this.addStatus = this.toggleAdd;
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Update statuses when inputs change
    if (changes['toggleSave']) {
      this.saveStatus = this.toggleSave;
    }
    if (changes['togglePrint']) {
      this.printStatus = this.togglePrint;
    }
    if (changes['toggleEdit']) {
      this.editStatus = this.toggleEdit;
    }
    if (changes['toggleAdd']) {
      this.addStatus = this.toggleAdd;
    }
  }

  onSavedClicked(){
    this.onSave.emit();
  }

  onPrintClicked(){
    this.onPrint.emit();
  }

  onEditClicked(){
    this.onEdit.emit();
  }

  onAddClicked(){
    this.onAdd.emit();
  }
}
