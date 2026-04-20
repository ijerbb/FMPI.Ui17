import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpService } from '../../../services/http.service';
import { AlertService } from '../../../services/alert.service';
import { DatabaseSelectionService } from '../../../services/database-selection.service';
import { DatabaseConfig } from '../../../models/dto/databaseConfig';
import { BirTransactionDto, BirTransactionFilterDto, TransactionHeaderForBirDto, RemoveTransactionRequest } from '../../../models/dto/birTransactionDto';
import { ResponseListDto } from '../../../models/dto/responseListDto';
import { ResponseDto } from '../../../models/dto/responseDto';
import { Bir2307PdfService } from '../../../services/bir-2307-pdf.service';
import { PdfPreviewModalComponent } from '../../../components/shared/pdf-preview-modal/pdf-preview-modal.component';
import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

@Component({
  selector: 'app-bir-posting-slsp',
  standalone: true,
  imports: [CommonModule, FormsModule, PdfPreviewModalComponent],
  templateUrl: './bir-posting-slsp.component.html',
  styleUrl: './bir-posting-slsp.component.css'
})
export class BirPostingSlspComponent implements OnInit {
  @ViewChild(PdfPreviewModalComponent) pdfPreviewModal!: PdfPreviewModalComponent;
  
  // Filter state
  filter: BirTransactionFilterDto = {
    year: new Date().getFullYear().toString(),  // Default to current year
    period: this.getCurrentMonthName(),  // Default to current month name (January, February, etc.)
    taxType: 0,  // Default to Sales
    pageNum: 1,
    pageSize: 10  // Show 10 records per page
  };

  // Data
  transactions: BirTransactionDto[] = [];
  transactionHeaders: TransactionHeaderForBirDto[] = [];
  totalRecords: number = 0;
  pageNum: number = 1;
  pageSize: number = 10;  // Show 10 records per page
  totalPages: number = 0;
  
  // Totals for all filtered records (not paginated)
  grandTotalAmount: number = 0;
  grandTotalTaxable: number = 0;
  grandTotalTaxAmount: number = 0;

  // Transaction Headers pagination
  headerPageNum: number = 1;
  headerPageSize: number = 10;  // Show 10 records at a time
  headerTotalRecords: number = 0;
  headerTotalPages: number = 0;

  // UI State
  isLoading: boolean = false;
  showHeaderPanel: boolean = false;
  selectedModuleType: string = 'Sales'; // or 'Purchases'
  filtersInitialized: boolean = false;
  transactionToDelete: BirTransactionDto | null = null;
  selectedTransactions: Set<number> = new Set(); // Track selected transaction sysPKs

  taxTypeOptions = [
    { value: 0, label: 'Sales' },
    { value: 1, label: 'Purchases' }
  ];

  // Period options - Full month names
  periodOptions = [
    { value: 'January', label: 'January' },
    { value: 'February', label: 'February' },
    { value: 'March', label: 'March' },
    { value: 'April', label: 'April' },
    { value: 'May', label: 'May' },
    { value: 'June', label: 'June' },
    { value: 'July', label: 'July' },
    { value: 'August', label: 'August' },
    { value: 'September', label: 'September' },
    { value: 'October', label: 'October' },
    { value: 'November', label: 'November' },
    { value: 'December', label: 'December' }
  ];

  // Month name to number mapping for PDF generation
  monthToNumberMap: { [key: string]: string } = {
    'January': '01',
    'February': '02',
    'March': '03',
    'April': '04',
    'May': '05',
    'June': '06',
    'July': '07',
    'August': '08',
    'September': '09',
    'October': '10',
    'November': '11',
    'December': '12'
  };

  // Year options (current year and 5 years back)
  yearOptions: { value: string, label: string }[] = [];

  // Database selection
  databases: DatabaseConfig[] = [];
  selectedDatabase: string = '';
  isLoadingDatabases: boolean = false;

  constructor(
    private httpService: HttpService,
    private alertService: AlertService,
    private bir2307PdfService: Bir2307PdfService,
    private dbSelectionService: DatabaseSelectionService
  ) {
    // Generate year options
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 5; i++) {
      const year = (currentYear - i).toString();
      this.yearOptions.push({ value: year, label: year });
    }
  }

  /**
   * Get current month name (January, February, etc.)
   */
  getCurrentMonthName(): string {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return months[new Date().getMonth()];
  }

  ngOnInit(): void {
    // Load available databases
    this.loadDatabases();
    // Auto-load data on init since we have default filters
    this.loadTransactions();
  }

  /**
   * Load available databases from API
   */
  loadDatabases(): void {
    this.isLoadingDatabases = true;
    this.httpService.getAvailableDatabases().subscribe({
      next: (response: ResponseDto) => {
        if (response.data) {
          this.databases = JSON.parse(response.data as string) as DatabaseConfig[];
          // Auto-select current database or first available
          const currentDb = this.dbSelectionService.getCurrentDatabase();
          if (currentDb && this.databases.some(db => db.DatabaseName === currentDb)) {
            this.selectedDatabase = currentDb;
          } else if (this.databases.length > 0) {
            this.selectedDatabase = this.databases[0].DatabaseName;
          }
        }
        this.isLoadingDatabases = false;
      },
      error: (error: any) => {
        this.isLoadingDatabases = false;
      }
    });
  }

  /**
   * Handle database selection change
   */
  onDatabaseChange(): void {
    this.dbSelectionService.setCurrentDatabase(this.selectedDatabase);

    // Reset selected transactions and clear grid
    this.selectedTransactions.clear();
    this.transactionHeaders = [];
    this.headerTotalRecords = 0;
    this.headerPageNum = 1;
    this.transactions = [];
    this.filtersInitialized = false;

    // Reload transactions with new database
    if (this.areFiltersComplete()) {
      this.loadTransactions();
    }
  }

  /**
   * Check if all filters are selected
   */
  areFiltersComplete(): boolean {
    return !!(this.filter.year && this.filter.period && this.filter.taxType !== null && this.filter.taxType !== undefined);
  }

  /**
   * Load transactions when all filters are selected
   */
  loadTransactions(): void {
    if (!this.areFiltersComplete()) {
      this.grandTotalAmount = 0;
      this.grandTotalTaxable = 0;
      this.grandTotalTaxAmount = 0;
      return;
    }

    this.isLoading = true;

    this.httpService.getBirTransactions(this.filter).subscribe({
      next: (response) => {
        this.transactions = response.lists || [];
        this.totalRecords = response.totalRecords;
        this.pageNum = response.pageNum;
        this.pageSize = 10; // Show 10 records per page
        this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
        this.isLoading = false;
        this.filtersInitialized = true;

        // Load grand totals for all filtered records (not paginated)
        this.loadGrandTotals();
      },
      error: (error: any) => {
        this.alertService.setCustomErrorAlert('Failed to load BIR transactions: ' + (error?.message || 'Unknown error'));
        this.isLoading = false;
        this.filtersInitialized = true;
      }
    });
  }

  /**
   * Load grand totals for all filtered records (not paginated)
   */
  loadGrandTotals(): void {
    this.httpService.getBirTransactionTotals(this.filter).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          // Parse the JSON string returned from API
          try {
            const totals = typeof response.data === 'string' 
              ? JSON.parse(response.data) 
              : response.data;
            
            // API returns PascalCase: TotalAmount, TotalTaxable, TaxAmount
            this.grandTotalAmount = totals.TotalAmount || totals.totalAmount || 0;
            this.grandTotalTaxable = totals.TotalTaxable || totals.totalTaxable || 0;
            this.grandTotalTaxAmount = totals.TaxAmount || totals.taxAmount || 0;
          } catch (e) {
          }
        }
      },
      error: (error: any) => {
      }
    });
  }

  /**
   * Handle filter changes
   */
  onFilterChange(): void {
    // Auto-sync Transactions panel module type with Tax Type filter
    this.selectedModuleType = this.filter.taxType === 0 ? 'Sales' : 'Purchases';

    if (this.areFiltersComplete()) {
      this.filter.pageNum = 1;
      this.loadTransactions();
      
      // Also reload transaction headers if panel is open
      if (this.showHeaderPanel) {
        this.loadTransactionHeaders(this.headerPageNum);
      }
    } else {
      // Reset when filters are incomplete
      this.transactions = [];
      this.totalRecords = 0;
      this.filtersInitialized = false;
    }
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.filter.pageNum = page;
    this.loadTransactions();
  }

  getPageEnd(): number {
    const end = this.pageNum * this.pageSize;
    return end > this.totalRecords ? this.totalRecords : end;
  }

  /**
   * Print transaction PDF (with preview modal) - Purchases only
   */
  printTransaction(transaction: BirTransactionDto): void {
    try {
      // Convert month name to number for PDF generation
      const monthNumber = transaction.period ? this.monthToNumberMap[transaction.period] : null;
      
      // Map transaction to PDF form data
      const formData: any = {
        year: transaction.year,
        period: monthNumber,  // Convert to number for PDF (MM format)
        taxType: transaction.taxType,
        transNum: transaction.transNum,
        source: transaction.source,
        dateTimeCreated: transaction.dateTimeCreated,
        
        // Derived fields
        periodFrom: null,  // Will be calculated by service
        periodTo: null,    // Will be calculated by service
        payeeTinNo: transaction.tinNo || null,
        payeeName: transaction.name || null,
        payeeRegisteredAddress: transaction.registeredAddress || null,
        payeeZipCode: transaction.zipCode || null,
        
        // Amount fields (divide TotalTaxable by 3 for monthly amounts)
        atcCode: transaction.atcCode || null,
        firstMonthAmount: transaction.totalTaxable ? transaction.totalTaxable / 3 : 0,
        secondMonthAmount: transaction.totalTaxable ? transaction.totalTaxable / 3 : 0,
        thirdMonthAmount: transaction.totalTaxable ? transaction.totalTaxable / 3 : 0,
        totalTaxable: transaction.totalTaxable,
        totalTaxWithheld: transaction.taxAmount,
        totalAmount: transaction.totalAmount,
        taxWithheld: transaction.taxAmount,
        
        // Calculate quarter from month number
        quarter: this.getQuarterFromPeriod(monthNumber)
      };

      // Generate PDF blob and show preview modal
      this.bir2307PdfService.generate2307PdfBlob(formData).then((blob: Blob) => {
        const transactionInfo = `${transaction.transNum} - ${transaction.name}`;
        this.pdfPreviewModal.showPreview(blob, transactionInfo);
        // Don't show success message - modal is shown instead
      }).catch((error: any) => {
        this.alertService.setCustomErrorAlert('Failed to generate PDF preview: ' + (error?.message || 'Unknown error'));
      });
    } catch (error: any) {
      this.alertService.setCustomErrorAlert('Failed to prepare PDF: ' + (error?.message || 'Unknown error'));
    }
  }

  /**
   * Remove transaction from BirTransaction table (delete, not just unpost)
   */
  removeTransaction(transaction: BirTransactionDto): void {
    this.transactionToDelete = transaction;

    // Show Bootstrap modal
    const modal = new (window as any).bootstrap.Modal(document.getElementById('deleteConfirmModal'));
    modal.show();
  }

  /**
   * Confirm removal after user clicks "Yes, Remove" in modal
   */
  confirmRemove(): void {
    if (!this.transactionToDelete) return;

    const request: RemoveTransactionRequest = {
      id: this.transactionToDelete.id || null
    };

    this.httpService.removeBirTransaction(request).subscribe({
      next: (response: ResponseDto) => {
        // Remove from local array (optimistic update)
        const index = this.transactions.findIndex(t => t.id === this.transactionToDelete?.id);
        if (index > -1) {
          this.transactions.splice(index, 1);
          this.totalRecords--;
        }
        this.alertService.setCustomSuccessAlert('Transaction removed successfully');

        // Close modal
        const modal = (window as any).bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal'));
        if (modal) {
          modal.hide();
        }
        this.transactionToDelete = null;
        
        // Refresh BIR Transactions grid
        this.loadTransactions();
      },
      error: (error: any) => {
        this.alertService.setCustomErrorAlert('Failed to remove transaction: ' + (error?.message || 'Unknown error'));
      }
    });
  }

  /**
   * Post selected transactions
   */
  postSelectedTransactions(): void {
    // For now, post all visible transactions
    const ids = this.transactions.map(t => t.id || 0).filter(id => id > 0);
    
    if (ids.length === 0) {
      alert('No transactions to post');
      return;
    }

    this.httpService.postBirTransactions(ids).subscribe({
      next: (response: ResponseDto) => {
        this.alertService.setCustomSuccessAlert(response.data || 'Transactions posted successfully');
        this.loadTransactions(); // Refresh grid
      },
      error: (error: any) => {
        this.alertService.setCustomErrorAlert('Failed to post transactions: ' + (error?.message || 'Unknown error'));
      }
    });
  }

  /**
   * Toggle transaction header panel
   */
  toggleHeaderPanel(): void {
    this.showHeaderPanel = !this.showHeaderPanel;
    if (this.showHeaderPanel && this.transactionHeaders.length === 0) {
      this.loadTransactionHeaders();
    }
  }

  /**
   * Get module type description
   */
  getModuleTypeDescription(moduleType: string | null | undefined): string {
    if (!moduleType) return '';
    
    const moduleTypeMap: { [key: string]: string } = {
      'CSHINVC': 'Cash Invoice',
      'CHGINVC': 'Charge Invoice',
      'CHGRR': 'Charge Receipt',
      'XPENSDIS': 'Expense Disbursement'
    };
    
    return moduleTypeMap[moduleType] || moduleType;
  }

  /**
   * Load transaction headers with pagination and filters
   */
  loadTransactionHeaders(pageNum: number = 1): void {
    this.headerPageNum = pageNum;
    
    // Convert period name to month number for API
    let periodMonth: number | null = null;
    if (this.filter.period) {
      const monthNum = this.monthToNumberMap[this.filter.period];
      periodMonth = monthNum ? parseInt(monthNum) : null;
    }

    this.httpService.getTransactionHeadersByModuleType(this.selectedModuleType, pageNum, this.filter.year, periodMonth).subscribe({
      next: (response: ResponseListDto<TransactionHeaderForBirDto>) => {
        this.transactionHeaders = response.lists || [];
        this.headerTotalRecords = response.totalRecords;
        this.headerPageNum = response.pageNum;
        this.headerPageSize = response.pageSize || 10;  // Use actual page size from response
        this.headerTotalPages = Math.ceil(this.headerTotalRecords / this.headerPageSize);
      },
      error: (error: any) => {
        this.alertService.setCustomErrorAlert('Failed to load transaction headers');
      }
    });
  }

  /**
   * Handle transaction header page change
   */
  onHeaderPageChange(page: number): void {
    if (page < 1 || page > this.headerTotalPages) return;
    this.loadTransactionHeaders(page);
  }

  /**
   * Get transaction headers page end record number
   */
  getHeaderPageEnd(): number {
    const end = this.headerPageNum * this.headerPageSize;
    return end > this.headerTotalRecords ? this.headerTotalRecords : end;
  }

  /**
   * Refresh transaction headers
   */
  refreshHeaders(): void {
    this.loadTransactionHeaders();
  }

  /**
   * Toggle selection of a transaction checkbox
   */
  toggleTransactionSelection(header: TransactionHeaderForBirDto): void {
    const sysPK = header.sysPK_TransH;
    if (sysPK === null || sysPK === undefined) return;

    if (this.selectedTransactions.has(sysPK)) {
      this.selectedTransactions.delete(sysPK);
    } else {
      this.selectedTransactions.add(sysPK);
    }
  }

  /**
   * Check if a transaction is selected
   */
  isTransactionSelected(sysPK: number | null | undefined): boolean {
    return sysPK !== null && sysPK !== undefined && this.selectedTransactions.has(sysPK);
  }

  /**
   * Select all visible transactions
   */
  selectAllTransactions(): void {
    this.transactionHeaders.forEach(header => {
      if (header.sysPK_TransH !== null && header.sysPK_TransH !== undefined) {
        this.selectedTransactions.add(header.sysPK_TransH);
      }
    });
  }

  /**
   * Deselect all transactions
   */
  deselectAllTransactions(): void {
    this.selectedTransactions.clear();
  }

  /**
   * Check if all visible transactions are selected
   */
  areAllTransactionsSelected(): boolean {
    if (this.transactionHeaders.length === 0) return false;
    return this.transactionHeaders.every(header =>
      header.sysPK_TransH === null ||
      header.sysPK_TransH === undefined ||
      this.selectedTransactions.has(header.sysPK_TransH)
    );
  }

  /**
   * Add all selected transactions to BIR table
   */
  addSelectedTransactions(): void {
    if (this.selectedTransactions.size === 0) {
      this.alertService.setCustomErrorAlert('No transactions selected. Please select at least one transaction.');
      return;
    }

    if (!this.filter.year || !this.filter.period) {
      this.alertService.setCustomErrorAlert('Please select Year and Period first');
      return;
    }

    const selectedSysPKs = Array.from(this.selectedTransactions);
    let successCount = 0;
    let errorCount = 0;
    let processedCount = 0;

    // Process each selected transaction
    selectedSysPKs.forEach(sysPK => {
      const addDto = {
        transactionHeaderId: sysPK,
        year: this.filter.year,
        period: this.filter.period,
        taxType: this.selectedModuleType === 'Sales' ? 0 : 1
      };

      this.httpService.addBirTransaction(addDto).subscribe({
        next: (response: any) => {
          processedCount++;
          if (response && response.success) {
            successCount++;
          } else {
            errorCount++;
          }

          // When all are processed
          if (processedCount === selectedSysPKs.length) {
            this.alertService.setCustomSuccessAlert(
              `${successCount} transaction(s) added successfully!${errorCount > 0 ? ` ${errorCount} failed.` : ''}`
            );
            this.selectedTransactions.clear();
            this.loadTransactionHeaders(this.headerPageNum);
          }
        },
        error: (error: any) => {
          processedCount++;
          errorCount++;

          // When all are processed
          if (processedCount === selectedSysPKs.length) {
            this.alertService.setCustomSuccessAlert(
              `${successCount} transaction(s) added successfully!${errorCount > 0 ? ` ${errorCount} failed.` : ''}`
            );
            this.selectedTransactions.clear();
            this.loadTransactionHeaders(this.headerPageNum);
          }
        }
      });
    });
  }

  /**
   * Check if transaction already exists in BirTransaction
   */
  transactionExists(sysPK: number): boolean {
    // Backend now filters out existing transactions, so this always returns false
    // The API only returns transactions that don't exist in BirTransaction
    return false;
  }

  /**
   * Get quarter label from period month (accepts both month name and number)
   */
  getQuarterFromPeriod(period: string | null): string {
    if (!period) return 'Q1';
    
    // If it's a month name, convert to number first
    let month: number;
    if (isNaN(parseInt(period))) {
      // It's a month name
      const monthNum = this.monthToNumberMap[period];
      month = monthNum ? parseInt(monthNum) : 1;
    } else {
      // It's already a number
      month = parseInt(period);
    }
    
    if (month <= 3) return 'Q1';
    if (month <= 6) return 'Q2';
    if (month <= 9) return 'Q3';
    return 'Q4';
  }

  /**
   * Get tax type badge class
   */
  getTaxTypeBadgeClass(taxType: number | null | undefined): string {
    return taxType === 0 ? 'badge bg-success' : 'badge bg-warning text-dark';
  }

  /**
   * Get tax type label
   */
  getTaxTypeLabel(taxType: number | null | undefined): string {
    return taxType === 0 ? 'Sales' : 'Purchases';
  }

  /**
   * Get posted status badge class
   */
  getPostedBadgeClass(isPosted: boolean | null | undefined): string {
    return isPosted ? 'badge bg-success' : 'badge bg-secondary';
  }

  /**
   * Get posted status label
   */
  getPostedStatusLabel(isPosted: boolean | null | undefined): string {
    return isPosted ? 'Posted' : 'Unposted';
  }

  /**
   * Calculate total Gross Total (TotalAmount)
   */
  getTotalAmount(): number {
    return this.transactions.reduce((sum, t) => sum + (t.totalAmount || 0), 0);
  }

  /**
   * Calculate total Net Taxable (TotalTaxable)
   */
  getTotalTaxable(): number {
    return this.transactions.reduce((sum, t) => sum + (t.totalTaxable || 0), 0);
  }

  /**
   * Calculate total Tax Amount
   */
  getTotalTaxAmount(): number {
    return this.transactions.reduce((sum, t) => sum + (t.taxAmount || 0), 0);
  }

  // Summary Report Methods (March 15, 2026)

  /**
   * Generate Summary Report - shows PDF directly in preview modal
   */
  generateSummaryReport(): void {
    if (!this.areFiltersComplete()) {
      this.alertService.setCustomErrorAlert('Please select Year, Period, and Tax Type first');
      return;
    }

    this.httpService.getBirTransactionSummaryReport(this.filter).subscribe({
      next: (response: any) => {
        // Try to get data from response
        let reportData = null;

        if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
          reportData = response.data;
        }
        else if (response.rawData && typeof response.rawData === 'string') {
          try {
            reportData = JSON.parse(response.rawData);
          } catch (e) {
          }
        }
        else if (response.data && typeof response.data === 'string') {
          try {
            reportData = JSON.parse(response.data);
          } catch (e) {
          }
        }

        if (reportData) {
          const records = reportData.Records || reportData.records || [];
          const totalGrossAmount = reportData.TotalGrossAmount || reportData.totalGrossAmount || 0;
          const totalTaxWithheld = reportData.TotalTaxWithheld || reportData.totalTaxWithheld || 0;

          if (!records || records.length === 0) {
            this.alertService.setCustomErrorAlert('No records found for the selected filters. Please save transactions first.');
            return;
          }

          // Generate PDF directly
          this.generateSummaryReportPdf(records, totalGrossAmount, totalTaxWithheld, reportData);
        } else {
          this.alertService.setCustomErrorAlert('No data returned from server. Check console for details.');
        }
      },
      error: (error: any) => {
        this.alertService.setCustomErrorAlert('Failed to load summary report: ' + (error?.message || 'Unknown error'));
      }
    });
  }

  /**
   * Generate PDF for Summary Report and show in preview modal
   */
  private generateSummaryReportPdf(records: any[], totalGrossAmount: number, totalTaxWithheld: number, reportData: any): void {
    const companyName = reportData.companyName || 'FMG Inc';
    const reportTitle = reportData.reportTitle || 'TAX WITHHELD SUMMARY REPORT';
    const year = reportData.year || this.filter.year;
    const period = reportData.period || this.filter.period;

    // Set up pdfmake vfs
    (pdfMake as any).vfs = (pdfFonts as any).vfs;

    // Build table body (header + rows)
    const body: any[][] = [
      [
        { text: 'No', style: 'tableHeader' },
        { text: 'Vendor Name', style: 'tableHeader' },
        { text: 'TIN', style: 'tableHeader' },
        { text: 'Total Amount', style: 'tableHeader', alignment: 'right' },
        { text: 'Tax Withheld', style: 'tableHeader', alignment: 'right' },
        { text: 'ATC Code', style: 'tableHeader' },
        { text: 'Tax Type', style: 'tableHeader' }
      ]
    ];

    // Data rows
    records.forEach((record: any, index: number) => {
      const vendorName = record.VendorName || record.vendorName || '';
      const tinNo = record.TinNo || record.tinNo || '';
      const totalAmount = record.TotalAmount || record.totalAmount || 0;
      const taxWithheld = record.TaxWithheld || record.taxWithheld || 0;
      const atcCode = record.ATCCode || record.atcCode || '';
      const taxRateType = record.TaxRateType || record.taxRateType || '';

      body.push([
        { text: (index + 1).toString(), fontSize: 9 },
        { text: vendorName, fontSize: 9 },
        { text: tinNo, fontSize: 9 },
        { text: totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), alignment: 'right', fontSize: 9 },
        { text: taxWithheld.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), alignment: 'right', fontSize: 9 },
        { text: atcCode, fontSize: 9 },
        { text: taxRateType, fontSize: 9 }
      ]);
    });

    // Totals row
    body.push([
      { text: '', colSpan: 3, border: [false, false, false, false] },
      {},
      {},
      { text: totalGrossAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), alignment: 'right', bold: true, fontSize: 10 },
      { text: totalTaxWithheld.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), alignment: 'right', bold: true, fontSize: 10 },
      { text: '', colSpan: 2, border: [false, false, false, false] },
      {}
    ]);

    const docDefinition: any = {
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
      content: [
        { text: companyName, style: 'companyName', alignment: 'center' },
        { text: reportTitle, style: 'reportTitle', alignment: 'center' },
        { text: `Year: ${year}  |  Period: ${period}`, style: 'periodInfo', alignment: 'center' },
        { text: '', margin: [0, 10] },
        {
          table: {
            headerRows: 1,
            widths: ['5%', '30%', '15%', '15%', '15%', '10%', '10%'],
            body: body
          },
          layout: {
            hLineWidth: () => 0.75,
            vLineWidth: () => 0.75,
            hLineColor: () => '#dee2e6',
            vLineColor: () => '#dee2e6',
            fillColor: (rowIndex: number) => {
              if (rowIndex === 0) return '#f8f9fa';
              if (rowIndex === body.length - 1) return '#f8f9fa';
              return null;
            },
            paddingTop: (rowIndex: number) => rowIndex === 0 ? 6 : 4,
            paddingBottom: (rowIndex: number) => rowIndex === 0 ? 6 : 4,
            paddingLeft: () => 6,
            paddingRight: () => 6
          }
        }
      ],
      styles: {
        companyName: { fontSize: 16, bold: true, margin: [0, 0, 0, 2] },
        reportTitle: { fontSize: 13, bold: true, margin: [0, 0, 0, 4] },
        periodInfo: { fontSize: 10, color: '#6c757d' },
        tableHeader: { fontSize: 9, bold: true, alignment: 'center' }
      }
    };

    pdfMake.createPdf(docDefinition).getBlob((blob: Blob) => {
      const reportInfo = `${reportTitle} - ${year} ${period}`;
      this.pdfPreviewModal.showPreview(blob, reportInfo);
    });
  }
}
