import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ListComponent } from '../../../components/shared/list/list.component';
import { TransactionConfigService } from '../../../services/transaction-config.service';
import { HttpService } from '../../../services/http.service';
import { AlertService } from '../../../services/alert.service';
import { TransactionHeaderDto } from '../../../models/dto/transactionHeaderDto';
import { TransactionListConfig, TransactionSearchCriteria } from '../../../models/dto/transactionListConfigDto';
import { ResponseListDto } from '../../../models/dto/responseListDto';

@Component({
  selector: 'app-other-adjustment',
  standalone: true,
  imports: [CommonModule, RouterModule, ListComponent],
  templateUrl: './other-adjustment.component.html',
  styleUrls: ['./other-adjustment.component.css']
})
export class OtherAdjustmentComponent implements OnInit {
  config!: TransactionListConfig;
  transactions: TransactionHeaderDto[] = [];
  totalRecords: number = 0;
  pageNum: number = 1;
  pageSize: number = 10;
  loading: boolean = false;

  constructor(
    private configService: TransactionConfigService,
    private httpService: HttpService,
    private alertService: AlertService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Load configuration for OTHERADJ module
    const config = this.configService.getConfig('OTHERADJ');
    if (config) {
      this.config = config;
      this.loadTransactions();
    } else {
      this.alertService.setCustomErrorAlert('Configuration not found for Other Adjustment module');
    }
  }

  /**
   * Load transactions with current search criteria
   */
  loadTransactions(criteria?: TransactionSearchCriteria): void {
    this.loading = true;
    
    this.httpService.getTransactionsByModuleType('OTHERADJ', this.pageNum, this.pageSize, criteria).subscribe({
      next: (response: ResponseListDto<TransactionHeaderDto>) => {
        this.transactions = response.lists || [];
        this.totalRecords = response.totalRecords || 0;
        this.pageNum = response.pageNum || 1;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('[OtherAdjustment] Error loading transactions:', error);
        this.alertService.setCustomErrorAlert('Failed to load transactions');
        this.loading = false;
        this.transactions = [];
        this.totalRecords = 0;
      }
    });
  }

  /**
   * Handle page change
   */
  onPageChange(page: number): void {
    this.pageNum = page;
    this.loadTransactions();
  }

  /**
   * Handle search
   */
  onSearch(criteria: TransactionSearchCriteria): void {
    this.pageNum = 1; // Reset to first page on search
    this.loadTransactions(criteria);
  }

  /**
   * Handle new transaction
   */
  onNewTransaction(): void {
    if (this.config.newRoute) {
      this.router.navigate([this.config.newRoute]);
    }
  }

  /**
   * Handle edit transaction
   */
  onEditTransaction(sysPK: number): void {
    if (this.config.detailRoutePrefix) {
      this.router.navigate([`${this.config.detailRoutePrefix}${sysPK}`]);
    }
  }

  /**
   * Handle view transaction
   */
  onViewTransaction(sysPK: number): void {
    // Navigate to view mode or same as edit for now
    this.onEditTransaction(sysPK);
  }

  /**
   * Handle print transaction
   */
  onPrintTransaction(sysPK: number): void {
    // TODO: Implement print functionality
    this.alertService.setCustomInfoAlert('Print functionality will be implemented soon');
  }

  /**
   * Handle void transaction
   */
  onVoidTransaction(sysPK: number): void {
    // TODO: Implement void functionality with confirmation
    this.alertService.setCustomInfoAlert('Void functionality will be implemented soon');
  }
}
