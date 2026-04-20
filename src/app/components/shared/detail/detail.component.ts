import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TransactionConfigService } from '../../../services/transaction-config.service';
import { HttpService } from '../../../services/http.service';
import { AlertService } from '../../../services/alert.service';
import { TransactionHeaderDto, TransactionLedgerItemDto } from '../../../models/dto/transactionHeaderDto';
import { TransactionListConfig } from '../../../models/dto/transactionListConfigDto';
import { ResponseDto } from '../../../models/dto/responseDto';
import { ActionMenuComponent } from '../../settings/action-menu/action-menu.component';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ActionMenuComponent],
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class DetailComponent implements OnInit {
  config!: TransactionListConfig;
  transaction: TransactionHeaderDto = {};
  ledgerItems: TransactionLedgerItemDto[] = [];
  sysPK: number | null = null;
  isEditMode: boolean = true; // Default to edit mode
  loading: boolean = false;
  moduleType: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private configService: TransactionConfigService,
    private httpService: HttpService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.moduleType = params['moduleType'] || 'OTHERADJ';
      const id = params['id'];

      // Load configuration for the module type
      this.config = this.configService.getConfig(this.moduleType) || this.configService.getConfig('OTHERADJ')!;

      if (id === 'new') {
        this.isEditMode = true;
        this.transaction = {
          moduleType: this.moduleType,
          dateIssue: new Date().toISOString().split('T')[0] // Default to today
        };
      } else {
        this.sysPK = +id;
        this.isEditMode = false; // Start in view mode
        this.loadTransaction();
      }
    });
  }

  loadTransaction(): void {
    if (!this.sysPK) {
      console.error('[TransactionDetail] No sysPK provided');
      this.alertService.setCustomErrorAlert('Invalid transaction ID');
      this.router.navigate([this.config.detailRoutePrefix || '/inventory/otheradj']);
      return;
    }

    console.log('[TransactionDetail] Loading transaction with sysPK:', this.sysPK);
    this.loading = true;
    this.httpService.getTransactionById(this.sysPK).subscribe({
      next: (response: ResponseDto) => {
        console.log('[TransactionDetail] API Response:', response);
        this.loading = false;

        if (response.success && response.data) {
          try {
            // Parse the JSON string data
            const data = typeof response.data === 'string' 
              ? JSON.parse(response.data) 
              : response.data;
            
            // Extract header and ledger items
            this.transaction = data as TransactionHeaderDto;
            this.ledgerItems = data.ledgerItems || [];
            
            console.log('[TransactionDetail] Loaded transaction:', this.transaction);
            console.log('[TransactionDetail] sysPK:', this.transaction.sysPK);
            console.log('[TransactionDetail] userPK:', this.transaction.userPK);
            console.log('[TransactionDetail] Ledger items:', this.ledgerItems.length);

            // Verify we got valid data
            if (!this.transaction.sysPK && !this.transaction.userPK) {
              console.warn('[TransactionDetail] Transaction data appears empty');
              this.alertService.setCustomErrorAlert('Transaction not found or invalid data');
              this.router.navigate([this.config.detailRoutePrefix || '/inventory/otheradj']);
            }
          } catch (e) {
            console.error('[TransactionDetail] Error parsing response data:', e);
            this.alertService.setCustomErrorAlert('Failed to parse transaction data');
            this.router.navigate([this.config.detailRoutePrefix || '/inventory/otheradj']);
          }
        } else {
          console.error('[TransactionDetail] Transaction not found:', response);
          this.alertService.setCustomErrorAlert(response.data?.toString() || 'Transaction not found');
          this.router.navigate([this.config.detailRoutePrefix || '/inventory/otheradj']);
        }
      },
      error: (error: any) => {
        console.error('[TransactionDetail] Error loading transaction:', error);
        this.loading = false;
        this.alertService.setCustomErrorAlert('Failed to load transaction details');
        this.router.navigate([this.config.detailRoutePrefix || '/inventory/otheradj']);
      }
    });
  }

  save(): void {
    // Validation
    if (!this.transaction.dateIssue) {
      this.alertService.setCustomErrorAlert('Date is required');
      return;
    }

    if (!this.transaction.totalAmount && this.transaction.totalAmount !== 0) {
      this.alertService.setCustomErrorAlert('Amount is required');
      return;
    }

    this.loading = true;

    // Prepare DTO for API
    const dto = {
      ...this.transaction,
      moduleType: this.moduleType,
      module: this.moduleType
    };

    // If new transaction (no sysPK), create; otherwise update
    if (!this.sysPK) {
      this.httpService.createTransaction(dto).subscribe({
        next: (response: ResponseDto) => {
          this.loading = false;
          if (response.success) {
            this.alertService.setCustomSuccessAlert('Transaction created successfully');
            this.router.navigate([this.config.detailRoutePrefix || '/inventory/otheradj']);
          } else {
            this.alertService.setCustomErrorAlert(response.data?.toString() || 'Failed to create transaction');
          }
        },
        error: (error: any) => {
          this.loading = false;
          console.error('[TransactionDetail] Error creating transaction:', error);
          this.alertService.setCustomErrorAlert('Failed to create transaction');
        }
      });
    } else {
      this.httpService.updateTransaction(dto).subscribe({
        next: (response: ResponseDto) => {
          this.loading = false;
          if (response.success) {
            this.alertService.setCustomSuccessAlert('Transaction updated successfully');
            this.router.navigate([this.config.detailRoutePrefix || '/inventory/otheradj']);
          } else {
            this.alertService.setCustomErrorAlert(response.data?.toString() || 'Failed to update transaction');
          }
        },
        error: (error: any) => {
          this.loading = false;
          console.error('[TransactionDetail] Error updating transaction:', error);
          this.alertService.setCustomErrorAlert('Failed to update transaction');
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate([this.config.detailRoutePrefix || '/inventory/otheradj']);
  }

  delete(): void {
    if (!this.sysPK) {
      this.alertService.setCustomErrorAlert('Cannot delete: No transaction ID');
      return;
    }

    const confirmed = confirm('Are you sure you want to delete this transaction?');
    if (!confirmed) return;

    this.loading = true;
    this.httpService.voidTransaction(this.sysPK).subscribe({
      next: (response: ResponseDto) => {
        this.loading = false;
        if (response.success) {
          this.alertService.setCustomSuccessAlert('Transaction deleted successfully');
          this.router.navigate([this.config.detailRoutePrefix || '/inventory/otheradj']);
        } else {
          this.alertService.setCustomErrorAlert(response.data?.toString() || 'Failed to delete transaction');
        }
      },
      error: (error: any) => {
        this.loading = false;
        console.error('[TransactionDetail] Error deleting transaction:', error);
        this.alertService.setCustomErrorAlert('Failed to delete transaction');
      }
    });
  }
}
