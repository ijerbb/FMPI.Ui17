import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css']
})
export class PaginationComponent {
  @Input() pageNum: number = 1;
  @Input() pageSize: number = 10;
  @Input() totalRecords: number = 0;
  @Output() pageChange = new EventEmitter<number>();

  /**
   * Get total number of pages
   */
  getTotalPages(): number {
    if (this.totalRecords === 0) return 0;
    return Math.ceil(this.totalRecords / this.pageSize);
  }

  /**
   * Get start record number for current page
   */
  getStartRecord(): number {
    if (this.totalRecords === 0) return 0;
    return (this.pageNum - 1) * this.pageSize + 1;
  }

  /**
   * Get end record number for current page
   */
  getEndRecord(): number {
    if (this.totalRecords === 0) return 0;
    const end = this.pageNum * this.pageSize;
    return end > this.totalRecords ? this.totalRecords : end;
  }

  /**
   * Handle page change event
   */
  onPageChange(page: number): void {
    if (page < 1) return;
    this.pageChange.emit(page);
  }
}
