import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApplicationConfigurationDto } from '../../../models/dto/applicationConfigurationDto';
import { ApplicationConfigurationService } from '../../../services/application-configuration.service';
import { AlertService } from '../../../services/alert.service';
import { ListComponent } from '../../../components/shared/list/list.component';
import { PaginationComponent } from '../../../components/shared/pagination/pagination.component';
import { TransactionListConfig, BulkAction } from '../../../models/dto/transactionListConfigDto';

@Component({
  selector: 'app-appconfig',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ListComponent,
    PaginationComponent
  ],
  templateUrl: './appconfig.component.html',
  styleUrls: ['./appconfig.component.css']
})
export class AppconfigComponent implements OnInit {
  configurations: ApplicationConfigurationDto[] = [];
  filteredConfigurations: ApplicationConfigurationDto[] = [];
  
  // Search
  searchStr: string = '';
  
  // Pagination
  pageNum: number = 1;
  pageSize: number = 10;
  totalRecords: number = 0;
  
  // Loading state
  loading: boolean = false;
  
  // Bulk selection properties
  selectedItems: Set<number> = new Set();
  selectAll: boolean = false;
  showBulkActionDropdown: boolean = false;
  
  // Transaction list config
  config: TransactionListConfig = {
    moduleType: 'APPCONFIG',
    title: 'Application Configuration',
    displayName: 'Application Configuration',
    columns: [
      { header: 'Key', field: 'key', type: 'text', clickable: true },
      { header: 'Description', field: 'description', type: 'text' },
      { header: 'Category', field: 'category', type: 'text' },
      { header: 'Value Preview', field: 'value', type: 'text', isJsonPreview: true }
    ],
    actions: [],
    enableBulkActions: true,
    bulkActions: [
      { label: 'Delete Selected', action: 'delete', requiresAdmin: true }
    ]
  };

  constructor(
    private configService: ApplicationConfigurationService,
    private alertService: AlertService
  ) {}

  
  ngOnInit(): void {
    console.log('[AppconfigComponent] ngOnInit - Starting');
    this.loadConfigurations();
  }

  loadConfigurations(): void {
    console.log('[AppconfigComponent] loadConfigurations - Starting');
    this.loading = true;
    this.configService.getAllConfigurations().subscribe({
      next: (result) => {
        console.log('[AppconfigComponent] loadConfigurations - Success:', result);
        this.configurations = result;
        this.totalRecords = result.length;
        this.applyFilters();
        this.loading = false;
        console.log('[AppconfigComponent] loadConfigurations - Completed, count:', result.length);
      },
      error: (error) => {
        console.error('[AppconfigComponent] loadConfigurations - Error:', error);
        console.error('[AppconfigComponent] loadConfigurations - Error status:', error.status);
        console.error('[AppconfigComponent] loadConfigurations - Error message:', error.message);
        console.error('[AppconfigComponent] loadConfigurations - Full error:', JSON.stringify(error, null, 2));
        this.alertService.setCustomErrorAlert('Failed to load configurations: ' + (error.message || 'Unknown error'));
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    if (!this.searchStr) {
      this.filteredConfigurations = this.configurations;
    } else {
      const searchLower = this.searchStr.toLowerCase();
      this.filteredConfigurations = this.configurations.filter(c => 
        c.key?.toLowerCase().includes(searchLower) ||
        c.description?.toLowerCase().includes(searchLower) ||
        c.category?.toLowerCase().includes(searchLower)
      );
    }
    this.totalRecords = this.filteredConfigurations.length;
    this.pageNum = 1; // Reset to first page on filter change
  }

  onSearch(): void {
    this.applyFilters();
  }

  onClearSearch(): void {
    this.searchStr = '';
    this.applyFilters();
  }

  /**
   * Toggle selection of a single item
   */
  toggleSelection(id: number | undefined): void {
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
      this.filteredConfigurations.forEach(c => {
        if (c.sysPk) this.selectedItems.add(c.sysPk);
      });
    }
    this.updateSelectAll();
  }
  
  /**
   * Update select all checkbox state
   */
  updateSelectAll(): void {
    this.selectAll = this.filteredConfigurations.length > 0 && 
      this.filteredConfigurations.every(c => c.sysPk && this.selectedItems.has(c.sysPk));
  }
  
  /**
   * Toggle bulk action dropdown
   */
  toggleBulkActionDropdown(): void {
    this.showBulkActionDropdown = !this.showBulkActionDropdown;
  }
  
  /**
   * Handle bulk action delete
   */
  onBulkActionDelete(): void {
    this.handleBulkDelete(Array.from(this.selectedItems));
  }

  /**
   * Handle page change
   */
  onPageChange(page: number): void {
    this.pageNum = page;
    const start = (this.pageNum - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.filteredConfigurations = this.configurations.slice(start, end);
  }

  /**
   * Handle bulk actions
   */
  onBulkAction(event: { action: string; selectedIds: number[] }): void {
    switch (event.action) {
      case 'delete':
        this.handleBulkDelete(event.selectedIds);
        break;
    }
  }

  /**
   * Handle bulk delete
   */
  handleBulkDelete(ids: number[]): void {
    if (ids.length === 0) return;

    const confirmed = confirm(`Are you sure you want to delete ${ids.length} configuration(s)?`);
    if (!confirmed) return;

    this.loading = true;
    this.configService.deleteMultipleConfigurations(ids).subscribe({
      next: (response) => {
        if (response.success) {
          this.alertService.setCustomSuccessAlert(
            `${ids.length} configuration(s) deleted successfully`
          );
          this.loadConfigurations();
        } else {
          this.alertService.setCustomErrorAlert(
            response.data?.toString() || 'Failed to delete configurations'
          );
          this.loading = false;
        }
      },
      error: (error) => {
        this.alertService.setCustomErrorAlert('Failed to delete configurations');
        this.loading = false;
      }
    });
  }
  
  /**
   * Format JSON preview (truncated)
   */
  formatJsonPreview(value: string | undefined): string {
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
   * Handle view transaction (navigate to detail)
   */
  onViewTransaction(sysPk: number | undefined): void {
    if (sysPk) {
      // Navigate to detail page - handled by router link
    }
  }
}
