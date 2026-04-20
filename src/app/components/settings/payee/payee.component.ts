import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UniversalMasterDto } from '../../../models/dto/universalMasterDto';
import { PayeeService } from '../../../services/payee.service';
import { AlertService } from '../../../services/alert.service';
import { ListComponent } from '../../../components/shared/list/list.component';
import { PaginationComponent } from '../../../components/shared/pagination/pagination.component';
import { TransactionConfigService } from '../../../services/transaction-config.service';
import { TransactionListConfig, TransactionSearchCriteria } from '../../../models/dto/transactionListConfigDto';

@Component({
  selector: 'app-payee',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ListComponent,
    PaginationComponent
  ],
  templateUrl: './payee.component.html',
  styleUrls: ['./payee.component.css']
})
export class PayeeComponent implements OnInit {
  config!: TransactionListConfig;
  allPayees: UniversalMasterDto[] = [];  // Original data from API
  payees: UniversalMasterDto[] = [];     // Filtered data (after search)
  filteredPayees: UniversalMasterDto[] = []; // Paginated data

  // Pagination
  pageNum: number = 1;
  pageSize: number = 10;
  totalRecords: number = 0;

  // Loading state
  loading: boolean = false;

  searchStr: string = '';

  constructor(
    private payeeService: PayeeService,
    private alertService: AlertService,
    private configService: TransactionConfigService
  ) {}

  ngOnInit(): void {
    console.log('[PayeeComponent] ngOnInit - Starting');
    // Load configuration for Payee module
    this.config = this.configService.getConfig('SUPLNT')!;
    this.loadPayees();
  }

  loadPayees(): void {
    console.log('[PayeeComponent] loadPayees - Starting');
    this.loading = true;
    this.payeeService.getAllPayees().subscribe({
      next: (result) => {
        console.log('[PayeeComponent] loadPayees - Success:', result);
        this.allPayees = result;  // Store original data
        this.payees = result;      // Initialize filtered data
        this.applyPagination();
        this.loading = false;
        console.log('[PayeeComponent] loadPayees - Completed, count:', result.length);
      },
      error: (error) => {
        console.error('[PayeeComponent] loadPayees - Error:', error);
        this.alertService.setCustomErrorAlert('Failed to load payees: ' + (error.message || 'Unknown error'));
        this.loading = false;
      }
    });
  }

  applyPagination(): void {
    const start = (this.pageNum - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.filteredPayees = this.payees.slice(start, end);
    this.totalRecords = this.payees.length;
  }

  /**
   * Smart search - searches across all columns with space-separated terms
   */
  applySmartSearch(searchTerm: string): UniversalMasterDto[] {
    if (!searchTerm || !searchTerm.trim()) {
      return this.allPayees;  // Return all if no search term
    }

    // Split search term by spaces and filter out empty strings
    const searchTerms = searchTerm.toLowerCase().split(/\s+/).filter(term => term.length > 0);

    if (searchTerms.length === 0) {
      return this.allPayees;
    }

    // Filter: ALL search terms must match (AND logic)
    return this.allPayees.filter(payee => {
      // Create searchable text from all fields
      const searchableText = [
        payee.userPK || '',
        payee.name || '',
        payee.tINVATNumber || '',
        payee.module || ''
      ].join(' ').toLowerCase();

      // All search terms must be found in the searchable text
      return searchTerms.every(term => searchableText.includes(term));
    });
  }

  /**
   * Handle bulk actions from list component
   */
  onBulkAction(event: { action: string; selectedIds: number[] }): void {
    console.log('[PayeeComponent] Bulk action:', event);
    if (event.action === 'delete') {
      this.handleBulkDelete(event.selectedIds);
    }
  }

  /**
   * Handle bulk delete
   */
  handleBulkDelete(ids: number[]): void {
    if (ids.length === 0) return;

    const confirmed = confirm(`Are you sure you want to delete ${ids.length} payee(s)?`);
    if (!confirmed) return;

    this.loading = true;
    this.payeeService.deleteMultiplePayees(ids).subscribe({
      next: (response) => {
        if (response.success) {
          this.alertService.setCustomSuccessAlert(
            `${ids.length} payee(s) deleted successfully`
          );
          this.loadPayees();
        } else {
          this.alertService.setCustomErrorAlert(
            response.data?.toString() || 'Failed to delete payees'
          );
          this.loading = false;
        }
      },
      error: (error) => {
        this.alertService.setCustomErrorAlert('Failed to delete payees');
        this.loading = false;
      }
    });
  }

  /**
   * Handle new payee
   */
  onNew(): void {
    // Navigation is handled by the list component via config.newRoute
  }

  /**
   * Handle page change
   */
  onPageChange(page: number): void {
    this.pageNum = page;
    this.applyPagination();
  }

  /**
   * Handle search
   */
  onSearch(criteria?: TransactionSearchCriteria): void {
    console.log('[PayeeComponent] Search:', criteria);
    const searchTerm = criteria?.userPK || '';
    // Apply smart search
    this.payees = this.applySmartSearch(searchTerm);
    // Reset to first page and apply pagination
    this.pageNum = 1;
    this.applyPagination();
  }

  /**
   * Clear search
   */
  onClearSearch(): void {
    this.searchStr = '';
    // Clear search by resetting to all payees
    this.payees = this.allPayees;
    this.pageNum = 1;
    this.applyPagination();
  }
}
