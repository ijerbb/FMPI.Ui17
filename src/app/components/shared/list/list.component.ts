import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PaginationComponent } from '../../../components/shared/pagination/pagination.component';
import { TransactionHeaderDto } from '../../../models/dto/transactionHeaderDto';
import { ResponseListDto } from '../../../models/dto/responseListDto';
import { TransactionListConfig, TransactionSearchCriteria, BulkAction } from '../../../models/dto/transactionListConfigDto';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PaginationComponent],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {
  @Input() config!: TransactionListConfig;
  @Input() transactions: TransactionHeaderDto[] = [];
  @Input() totalRecords: number = 0;
  @Input() pageNum: number = 1;
  @Input() pageSize: number = 10;
  @Input() loading: boolean = false;
  
  // Bulk action inputs
  @Input() enableBulkActions: boolean = false;
  @Input() bulkActions: BulkAction[] = [];

  @Output() pageChange = new EventEmitter<number>();
  @Output() search = new EventEmitter<TransactionSearchCriteria>();
  @Output() newTransaction = new EventEmitter<void>();
  @Output() editTransaction = new EventEmitter<number>();
  @Output() viewTransaction = new EventEmitter<number>();
  @Output() printTransaction = new EventEmitter<number>();
  @Output() voidTransaction = new EventEmitter<number>();
  @Output() bulkAction = new EventEmitter<{ action: string; selectedIds: number[] }>();

  searchCriteria: TransactionSearchCriteria = {};
  showAdvancedSearch: boolean = false;
  searchInput: string = '';

  // Bulk selection properties
  selectedItems: Set<number> = new Set();
  selectAll: boolean = false;
  showBulkActionDropdown: boolean = false;

  ngOnInit(): void {
    // Initialize search criteria with defaults
    this.searchCriteria = {
      moduleType: this.config.moduleType
    };
  }

  /**
   * Get searchable field names from column headers
   */
  getSearchFieldNames(): string {
    if (!this.config.columns || this.config.columns.length === 0) {
      return 'all fields';
    }
    return this.config.columns.map(col => col.header).join(', ');
  }

  onSearchInputChange(): void {
    // Emit search input value for parent to filter
    const searchCriteria: TransactionSearchCriteria = {
      moduleType: this.config.moduleType,
      userPK: this.searchInput // Pass search text in userPK field for backward compatibility
    };
    this.search.emit(searchCriteria);
  }

  onSearch(): void {
    console.log('[List] Search criteria:', this.searchCriteria);
    this.searchCriteria.moduleType = this.config.moduleType;
    this.search.emit(this.searchCriteria);
  }

  onClearSearch(): void {
    this.searchInput = '';
    this.searchCriteria = {
      moduleType: this.config.moduleType
    };
    this.showAdvancedSearch = false;
    this.search.emit(this.searchCriteria);
  }

  onRefresh(): void {
    // Emit refresh event or reload data
    this.onSearch();
  }

  toggleAdvancedSearch(): void {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }

  onPageChange(page: number): void {
    this.pageChange.emit(page);
  }

  onNewTransaction(): void {
    this.newTransaction.emit();
  }

  onEditTransaction(sysPK: number): void {
    this.editTransaction.emit(sysPK);
  }

  onViewTransaction(sysPK: number): void {
    console.log('[TransactionList] onViewTransaction called with sysPK:', sysPK);
    this.viewTransaction.emit(sysPK);
  }

  onPrintTransaction(sysPK: number): void {
    this.printTransaction.emit(sysPK);
  }

  onVoidTransaction(sysPK: number): void {
    this.voidTransaction.emit(sysPK);
  }
  
  /**
   * Toggle selection of a single item
   */
  toggleSelection(id: number | null | undefined): void {
    if (!id) return;
    
    if (this.selectedItems.has(id)) {
      this.selectedItems.delete(id);
    } else {
      this.selectedItems.add(id);
    }
    this.updateSelectAll();
  }
  
  /**
   * Toggle select all items
   */
  toggleSelectAll(): void {
    this.selectedItems.clear();
    if (this.selectAll) {
      this.transactions.forEach(t => {
        if (t.sysPK) this.selectedItems.add(t.sysPK);
      });
    }
    this.updateSelectAll();
  }
  
  /**
   * Update select all checkbox state
   */
  updateSelectAll(): void {
    this.selectAll = this.transactions.length > 0 && 
      this.transactions.every(t => t.sysPK && this.selectedItems.has(t.sysPK));
  }
  
  /**
   * Handle bulk action selection
   */
  onBulkAction(action: string): void {
    this.bulkAction.emit({ 
      action, 
      selectedIds: Array.from(this.selectedItems) 
    });
    this.showBulkActionDropdown = false;
  }
  
  /**
   * Toggle bulk action dropdown
   */
  toggleBulkActionDropdown(): void {
    this.showBulkActionDropdown = !this.showBulkActionDropdown;
  }

  /**
   * Get column value dynamically from transaction object
   */
  getColumnValue(transaction: any, columnField: string): any {
    if (!columnField) return '';

    // Support nested properties (e.g., 'account.name')
    const parts = columnField.split('.');
    let value: any = transaction;

    for (const part of parts) {
      if (value === null || value === undefined) return '';
      value = value[part];
    }

    return value !== null && value !== undefined ? value : '';
  }

  /**
   * Get system primary key (handles both sysPK and sysPk)
   */
  getItemSysPk(item: any): number | undefined {
    return item.sysPK || item.sysPk;
  }

  /**
   * Format value based on column type
   */
  formatValue(value: any, columnType?: string): string {
    if (value === null || value === undefined || value === '') {
      return '-';
    }

    switch (columnType) {
      case 'currency':
        const numValue = Number(value);
        if (isNaN(numValue)) return '-';
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'PHP'
        }).format(numValue);
      case 'date':
        const dateValue = new Date(value);
        if (isNaN(dateValue.getTime())) return '-';
        return dateValue.toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
      case 'number':
        const numberValue = Number(value);
        if (isNaN(numberValue)) return '-';
        return new Intl.NumberFormat('en-US').format(numberValue);
      default:
        return String(value);
    }
  }
  
  /**
   * Format JSON preview (truncated)
   */
  formatJsonPreview(value: string): string {
    if (!value) return '-';
    try {
      const parsed = JSON.parse(value);
      const str = JSON.stringify(parsed);
      if (str.length > 50) {
        return str.substring(0, 50) + '...';
      }
      return str;
    } catch {
      return value.substring(0, 50) + (value.length > 50 ? '...' : '');
    }
  }

  /**
   * Check if action should be shown
   */
  shouldShowAction(action: string): boolean {
    if (!this.config.actions) return true;
    return this.config.actions.includes(action);
  }
}
