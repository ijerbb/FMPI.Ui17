import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UniversalMasterDto } from '../../../models/dto/universalMasterDto';
import { SupplierService } from '../../../services/supplier.service';
import { AlertService } from '../../../services/alert.service';
import { ListComponent } from '../../../components/shared/list/list.component';
import { PaginationComponent } from '../../../components/shared/pagination/pagination.component';
import { TransactionConfigService } from '../../../services/transaction-config.service';
import { TransactionListConfig, TransactionSearchCriteria } from '../../../models/dto/transactionListConfigDto';

@Component({
  selector: 'app-supplier',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ListComponent,
    PaginationComponent
  ],
  templateUrl: './supplier.component.html',
  styleUrls: ['./supplier.component.css']
})
export class SupplierComponent implements OnInit {
  config!: TransactionListConfig;
  allSuppliers: UniversalMasterDto[] = [];  // Original data from API
  suppliers: UniversalMasterDto[] = [];     // Filtered data (after search)
  filteredSuppliers: UniversalMasterDto[] = []; // Paginated data

  // Pagination
  pageNum: number = 1;
  pageSize: number = 10;
  totalRecords: number = 0;

  // Loading state
  loading: boolean = false;

  searchStr: string = '';

  constructor(
    private supplierService: SupplierService,
    private alertService: AlertService,
    private configService: TransactionConfigService
  ) {}

  ngOnInit(): void {
    console.log('[SupplierComponent] ngOnInit - Starting');
    // Load configuration for Supplier module
    this.config = this.configService.getConfig('SUPL')!;
    this.loadSuppliers();
  }

  loadSuppliers(): void {
    console.log('[SupplierComponent] loadSuppliers - Starting');
    this.loading = true;
    this.supplierService.getAllSuppliers().subscribe({
      next: (result) => {
        console.log('[SupplierComponent] loadSuppliers - Success:', result);
        this.allSuppliers = result;  // Store original data
        this.suppliers = result;      // Initialize filtered data
        this.applyPagination();
        this.loading = false;
        console.log('[SupplierComponent] loadSuppliers - Completed, count:', result.length);
      },
      error: (error) => {
        console.error('[SupplierComponent] loadSuppliers - Error:', error);
        this.alertService.setCustomErrorAlert('Failed to load suppliers: ' + (error.message || 'Unknown error'));
        this.loading = false;
      }
    });
  }

  applyPagination(): void {
    const start = (this.pageNum - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.filteredSuppliers = this.suppliers.slice(start, end);
    this.totalRecords = this.suppliers.length;
  }

  /**
   * Smart search - searches across all columns with space-separated terms
   */
  applySmartSearch(searchTerm: string): UniversalMasterDto[] {
    if (!searchTerm || !searchTerm.trim()) {
      return this.allSuppliers;  // Return all if no search term
    }

    // Split search term by spaces and filter out empty strings
    const searchTerms = searchTerm.toLowerCase().split(/\s+/).filter(term => term.length > 0);

    if (searchTerms.length === 0) {
      return this.allSuppliers;
    }

    // Filter: ALL search terms must match (AND logic)
    return this.allSuppliers.filter(supplier => {
      // Create searchable text from all fields
      const searchableText = [
        supplier.userPK || '',
        supplier.name || '',
        supplier.tINVATNumber || '',
        supplier.module || ''
      ].join(' ').toLowerCase();

      // All search terms must be found in the searchable text
      return searchTerms.every(term => searchableText.includes(term));
    });
  }

  /**
   * Handle bulk actions from list component
   */
  onBulkAction(event: { action: string; selectedIds: number[] }): void {
    console.log('[SupplierComponent] Bulk action:', event);
    if (event.action === 'delete') {
      this.handleBulkDelete(event.selectedIds);
    }
  }

  /**
   * Handle bulk delete
   */
  handleBulkDelete(ids: number[]): void {
    if (ids.length === 0) return;

    const confirmed = confirm(`Are you sure you want to delete ${ids.length} supplier(s)?`);
    if (!confirmed) return;

    this.loading = true;
    this.supplierService.deleteMultipleSuppliers(ids).subscribe({
      next: (response) => {
        if (response.success) {
          this.alertService.setCustomSuccessAlert(
            `${ids.length} supplier(s) deleted successfully`
          );
          this.loadSuppliers();
        } else {
          this.alertService.setCustomErrorAlert(
            response.data?.toString() || 'Failed to delete suppliers'
          );
          this.loading = false;
        }
      },
      error: (error) => {
        this.alertService.setCustomErrorAlert('Failed to delete suppliers');
        this.loading = false;
      }
    });
  }

  /**
   * Handle new supplier
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
    console.log('[SupplierComponent] Search:', criteria);
    const searchTerm = criteria?.userPK || '';
    // Apply smart search
    this.suppliers = this.applySmartSearch(searchTerm);
    // Reset to first page and apply pagination
    this.pageNum = 1;
    this.applyPagination();
  }

  /**
   * Clear search
   */
  onClearSearch(): void {
    this.searchStr = '';
    // Clear search by resetting to all suppliers
    this.suppliers = this.allSuppliers;
    this.pageNum = 1;
    this.applyPagination();
  }
}
