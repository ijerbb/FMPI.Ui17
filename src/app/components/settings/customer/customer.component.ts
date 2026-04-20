import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UniversalMasterDto } from '../../../models/dto/universalMasterDto';
import { CustomerService } from '../../../services/customer.service';
import { AlertService } from '../../../services/alert.service';
import { ListComponent } from '../../../components/shared/list/list.component';
import { PaginationComponent } from '../../../components/shared/pagination/pagination.component';
import { TransactionConfigService } from '../../../services/transaction-config.service';
import { TransactionListConfig, TransactionSearchCriteria } from '../../../models/dto/transactionListConfigDto';

@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ListComponent,
    PaginationComponent
  ],
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})
export class CustomerComponent implements OnInit {
  config!: TransactionListConfig;
  allCustomers: UniversalMasterDto[] = [];  // Original data from API
  customers: UniversalMasterDto[] = [];     // Filtered data (after search)
  filteredCustomers: UniversalMasterDto[] = []; // Paginated data

  // Pagination
  pageNum: number = 1;
  pageSize: number = 10;
  totalRecords: number = 0;

  // Loading state
  loading: boolean = false;

  constructor(
    private customerService: CustomerService,
    private alertService: AlertService,
    private configService: TransactionConfigService
  ) {}

  ngOnInit(): void {
    console.log('[CustomerComponent] ngOnInit - Starting');
    // Load configuration for Customer module
    this.config = this.configService.getConfig('CUST')!;
    this.loadCustomers();
  }

  loadCustomers(): void {
    console.log('[CustomerComponent] loadCustomers - Starting');
    this.loading = true;
    this.customerService.getAllCustomers().subscribe({
      next: (result) => {
        console.log('[CustomerComponent] loadCustomers - Success:', result);
        this.allCustomers = result;  // Store original data
        this.customers = result;      // Initialize filtered data
        this.applyPagination();
        this.loading = false;
        console.log('[CustomerComponent] loadCustomers - Completed, count:', result.length);
      },
      error: (error) => {
        console.error('[CustomerComponent] loadCustomers - Error:', error);
        this.alertService.setCustomErrorAlert('Failed to load customers: ' + (error.message || 'Unknown error'));
        this.loading = false;
      }
    });
  }

  applyPagination(): void {
    const start = (this.pageNum - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.filteredCustomers = this.customers.slice(start, end);
    this.totalRecords = this.customers.length;
  }

  /**
   * Smart search - searches across all columns with space-separated terms
   */
  applySmartSearch(searchTerm: string): UniversalMasterDto[] {
    if (!searchTerm || !searchTerm.trim()) {
      return this.allCustomers;  // Return all if no search term
    }

    // Split search term by spaces and filter out empty strings
    const searchTerms = searchTerm.toLowerCase().split(/\s+/).filter(term => term.length > 0);

    if (searchTerms.length === 0) {
      return this.allCustomers;
    }

    // Filter: ALL search terms must match (AND logic)
    return this.allCustomers.filter(customer => {
      // Create searchable text from all fields
      const searchableText = [
        customer.userPK || '',
        customer.name || '',
        customer.tINVATNumber || '',
        customer.module || ''
      ].join(' ').toLowerCase();

      // All search terms must be found in the searchable text
      return searchTerms.every(term => searchableText.includes(term));
    });
  }

  /**
   * Handle bulk actions from list component
   */
  onBulkAction(event: { action: string; selectedIds: number[] }): void {
    console.log('[CustomerComponent] Bulk action:', event);
    if (event.action === 'delete') {
      this.handleBulkDelete(event.selectedIds);
    }
  }

  /**
   * Handle bulk delete
   */
  handleBulkDelete(ids: number[]): void {
    if (ids.length === 0) return;

    const confirmed = confirm(`Are you sure you want to delete ${ids.length} customer(s)?`);
    if (!confirmed) return;

    this.loading = true;
    this.customerService.deleteMultipleCustomers(ids).subscribe({
      next: (response) => {
        if (response.success) {
          this.alertService.setCustomSuccessAlert(
            `${ids.length} customer(s) deleted successfully`
          );
          this.loadCustomers();
        } else {
          this.alertService.setCustomErrorAlert(
            response.data?.toString() || 'Failed to delete customers'
          );
          this.loading = false;
        }
      },
      error: (error) => {
        this.alertService.setCustomErrorAlert('Failed to delete customers');
        this.loading = false;
      }
    });
  }

  /**
   * Handle new customer
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
    console.log('[CustomerComponent] Search:', criteria);
    const searchTerm = criteria?.userPK || '';
    // Apply smart search
    this.customers = this.applySmartSearch(searchTerm);
    // Reset to first page and apply pagination
    this.pageNum = 1;
    this.applyPagination();
  }

  /**
   * Clear search
   */
  onClearSearch(): void {
    this.searchStr = '';
    // Clear search by resetting to all customers
    this.customers = this.allCustomers;
    this.pageNum = 1;
    this.applyPagination();
  }

  searchStr: string = '';
}
