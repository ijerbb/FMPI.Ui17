import { Injectable } from '@angular/core';
import { TransactionListConfig } from '../models/dto/transactionListConfigDto';

/**
 * Module type names mapping
 */
export const MODULE_TYPE_NAMES: { [key: string]: string } = {
  'BRANCHRELS': 'Branch Releasing',
  'BRANCHRTN': 'Branch Return',
  'BRCHRELS': 'Branch Releasing',
  'BRCHSALRETN': 'Branch Sales Return',
  'CASHPURCDIS': 'Cash Purchase',
  'CHGHOBRANCH': 'Branch Purchase Receiving',
  'CHGINVC': 'Charge Invoice',
  'CHGRR': 'Charge Receiving',
  'CHGRRBALFWD': 'Charge Receiving Balance Forward',
  'CHKCHNGDIS': 'Check Change',
  'CNCLPROVI': 'Cancel Receipt',
  'CREDITMEMO': 'Credit Memo',
  'CSHINVC': 'Cash Invoice',
  'CSHINVOICE': 'Cash Invoice',
  'FNSGIVTXF': 'Product Transformation',
  'GENJRNL': 'General Journal',
  'IVTBRKDWN': 'Product Break Down',
  'IVTORIGPROD': 'IVT Original Product',
  'OTHERADJ': 'Other Adjustment',
  'PCMPTRY': 'Complimentary Receiving',
  'POCHGRR': 'PO Charge Receiving',
  'PORDER': 'Purchase Order',
  'PURPCKNG': 'Packing List',
  'PURREPLCRR': 'Purchase Replacement',
  'PURRTN': 'Purchase Return',
  'PURRTN2WRSE': 'Purchase Return to Warehouse',
  'PURRTNREPL': 'Purchase Return Replacement',
  'PURRTNWRSEPULOUT': 'Purchase Returns Warehouse Pull Out',
  'REPLCINVC': 'Sales Replacement',
  'RWMTIVTXF': 'Raw Material Transformation',
  'SALRTN': 'Sales Return',
  'SALRTNREPL': 'Sales Replacement',
  'SCMPTRY': 'Complimentary Invoice',
  'XPENSDIS': 'Expense Disbursement',
  'HOBRANCHRTN': 'Head Office Branch Return',
  'CUST': 'Customer',
  'SUPL': 'Supplier',
  'SUPLNT': 'Payee'
};

/**
 * Module category mapping
 */
export const MODULE_CATEGORIES: { [key: string]: string } = {
  'IP': 'Setup',
  'SU': 'Setup',
  'BRANCHRELS': 'Inventory',
  'BRANCHRTN': 'Inventory',
  'BRCHRELS': 'Inventory',
  'BRCHSALRETN': 'Sales',
  'CASHPURCDIS': 'Purchasing',
  'CHGHOBRANCH': 'Purchasing',
  'CHGINVC': 'Sales',
  'CHGRR': 'Purchasing',
  'CHGRRBALFWD': 'Purchasing',
  'CHKCHNGDIS': 'Financial',
  'CNCLPROVI': 'Financial',
  'CREDITMEMO': 'Financial',
  'CSHINVC': 'Sales',
  'CSHINVOICE': 'Sales',
  'FNSGIVTXF': 'Inventory',
  'GENJRNL': 'Financial',
  'IVTBRKDWN': 'Inventory',
  'IVTORIGPROD': 'Inventory',
  'OTHERADJ': 'Inventory',
  'PCMPTRY': 'Purchasing',
  'POCHGRR': 'Purchasing',
  'PORDER': 'Purchasing',
  'PURPCKNG': 'Purchasing',
  'PURREPLCRR': 'Purchasing',
  'PURRTN': 'Purchasing',
  'PURRTN2WRSE': 'Inventory',
  'PURRTNREPL': 'Purchasing',
  'PURRTNWRSEPULOUT': 'Inventory',
  'REPLCINVC': 'Sales',
  'RWMTIVTXF': 'Inventory',
  'SALRTN': 'Sales',
  'SALRTNREPL': 'Sales',
  'SCMPTRY': 'Sales',
  'XPENSDIS': 'Financial',
  'HOBRANCHRTN': 'Inventory',
  'CUST': 'Setup',
  'SUPL': 'Setup',
  'SUPLNT': 'Setup'
};

@Injectable({
  providedIn: 'root'
})
export class TransactionConfigService {
  
  /**
   * Get configuration for a specific module type
   */
  getConfig(moduleType: string): TransactionListConfig | null {
    const config = this.moduleConfigs.find(c => c.moduleType === moduleType);
    return config || null;
  }

  /**
   * Get all configurations for a category
   */
  getConfigsByCategory(category: string): TransactionListConfig[] {
    return this.moduleConfigs.filter(config => {
      const moduleCategory = MODULE_CATEGORIES[config.moduleType];
      return moduleCategory === category;
    });
  }

  /**
   * Get module display name
   */
  getModuleName(moduleType: string): string {
    return MODULE_TYPE_NAMES[moduleType] || moduleType;
  }

  /**
   * Get module category
   */
  getModuleCategory(moduleType: string): string {
    return MODULE_CATEGORIES[moduleType] || 'Other';
  }

  /**
   * Module-specific configurations
   */
  private moduleConfigs: TransactionListConfig[] = [
    // APPCONFIG - Application Configuration
    {
      moduleType: 'APPCONFIG',
      title: 'Application Configuration',
      displayName: 'Application Configuration',
      headerIcon: 'bi-gear-fill',
      searchFields: ['key', 'description', 'category'],
      columns: [
        { 
          header: 'Key', 
          field: 'key', 
          type: 'text',
          clickable: true 
        },
        { 
          header: 'Description', 
          field: 'description', 
          type: 'text' 
        },
        { 
          header: 'Category', 
          field: 'category', 
          type: 'text' 
        },
        { 
          header: 'Value Preview', 
          field: 'value', 
          type: 'text',
          isJsonPreview: true 
        }
      ],
      actions: [],
      enableBulkActions: true,
      bulkActions: [
        { label: 'Delete Selected', action: 'delete', requiresAdmin: true }
      ],
      newRoute: '/settings/appconfig/new',
      detailRoutePrefix: '/settings/appconfig/'
    },
    
    // OTHERADJ - Other Adjustment
    {
      moduleType: 'OTHERADJ',
      title: 'Other Adjustment',
      headerIcon: 'bi-sliders',
      searchFields: ['userPK', 'accountName', 'dateFrom', 'dateTo'],
      advancedSearchFields: [
        { key: 'particulars', label: 'Particulars', placeholder: 'Enter particulars' },
        { key: 'branch', label: 'Branch', placeholder: 'Enter branch' },
        { key: 'status', label: 'Status', placeholder: 'Enter status' }
      ],
      columns: [
        {
          header: 'Date',
          field: 'dateIssue',
          type: 'date',
          width: '120px'
        },
        {
          header: 'Trans No',
          field: 'userPK',
          width: '150px',
          cellClass: 'text-primary fw-bold',
          isLink: true
        },
        {
          header: 'Account',
          field: 'accountName',
          width: '200px'
        },
        {
          header: 'Particulars',
          field: 'particulars',
          width: '250px'
        },
        {
          header: 'Amount',
          field: 'totalAmount',
          type: 'currency',
          headerClass: 'text-end',
          cellClass: 'text-end',
          width: '150px'
        }
      ],
      actions: ['edit'],
      newRoute: '/inventory/otheradj/new',
      detailRoutePrefix: '/inventory/otheradj/'
    },
    
    // CSHINVC - Cash Invoice
    {
      moduleType: 'CSHINVC',
      title: 'Cash Invoice',
      headerIcon: 'bi-cash-coin',
      searchFields: ['userPK', 'accountName', 'dateFrom', 'dateTo'],
      advancedSearchFields: [
        { key: 'particulars', label: 'Particulars', placeholder: 'Enter particulars' },
        { key: 'branch', label: 'Branch', placeholder: 'Enter branch' }
      ],
      columns: [
        { header: 'Date', field: 'dateIssue', type: 'date', width: '120px' },
        { header: 'Trans No', field: 'userPK', width: '150px', cellClass: 'text-primary fw-bold', isLink: true },
        { header: 'Customer', field: 'accountName', width: '250px' },
        { header: 'Amount', field: 'totalAmount', type: 'currency', headerClass: 'text-end', cellClass: 'text-end', width: '150px' }
      ],
      actions: ['edit'],
      newRoute: '/transaction/CSHINVC/new',
      detailRoutePrefix: '/transaction/CSHINVC/'
    },
    
    // CHGINVC - Charge Invoice
    {
      moduleType: 'CHGINVC',
      title: 'Charge Invoice',
      headerIcon: 'bi-receipt',
      searchFields: ['userPK', 'accountName', 'dateFrom', 'dateTo'],
      advancedSearchFields: [
        { key: 'particulars', label: 'Particulars', placeholder: 'Enter particulars' }
      ],
      columns: [
        { header: 'Date', field: 'dateIssue', type: 'date', width: '120px' },
        { header: 'Trans No', field: 'userPK', width: '150px', cellClass: 'text-primary fw-bold', isLink: true },
        { header: 'Customer', field: 'accountName', width: '250px' },
        { header: 'Amount', field: 'totalAmount', type: 'currency', headerClass: 'text-end', cellClass: 'text-end', width: '150px' }
      ],
      actions: ['edit'],
      newRoute: '/transaction/CHGINVC/new',
      detailRoutePrefix: '/transaction/CHGINVC/'
    },

    // CUST - Customer
    {
      moduleType: 'CUST',
      title: 'Customer',
      displayName: 'Customer',
      headerIcon: 'bi-person-badge',
      searchFields: ['userPK', 'name', 'tINVATNumber'],
      columns: [
        {
          header: 'Code',
          field: 'userPK',
          type: 'text',
          isLink: true
        },
        {
          header: 'Name',
          field: 'name',
          type: 'text'
        },
        {
          header: 'TIN/VAT Number',
          field: 'tINVATNumber',
          type: 'text'
        }
      ],
      actions: [],
      enableBulkActions: true,
      bulkActions: [
        { label: 'Delete Selected', action: 'delete', requiresAdmin: true }
      ],
      newRoute: '/settings/customer/new',
      detailRoutePrefix: '/settings/customer/'
    },

    // SUPL - Supplier
    {
      moduleType: 'SUPL',
      title: 'Supplier',
      displayName: 'Supplier',
      headerIcon: 'bi-building',
      searchFields: ['userPK', 'name', 'tINVATNumber'],
      columns: [
        {
          header: 'Code',
          field: 'userPK',
          type: 'text',
          isLink: true
        },
        {
          header: 'Name',
          field: 'name',
          type: 'text'
        },
        {
          header: 'TIN/VAT Number',
          field: 'tINVATNumber',
          type: 'text'
        }
      ],
      actions: [],
      enableBulkActions: true,
      bulkActions: [
        { label: 'Delete Selected', action: 'delete', requiresAdmin: true }
      ],
      newRoute: '/settings/supplier/new',
      detailRoutePrefix: '/settings/supplier/'
    },

    // SUPLNT - Payee
    {
      moduleType: 'SUPLNT',
      title: 'Payee',
      displayName: 'Payee',
      headerIcon: 'bi-cash-stack',
      searchFields: ['userPK', 'name', 'tINVATNumber'],
      columns: [
        {
          header: 'Code',
          field: 'userPK',
          type: 'text',
          isLink: true
        },
        {
          header: 'Name',
          field: 'name',
          type: 'text'
        },
        {
          header: 'TIN/VAT Number',
          field: 'tINVATNumber',
          type: 'text'
        }
      ],
      actions: [],
      enableBulkActions: true,
      bulkActions: [
        { label: 'Delete Selected', action: 'delete', requiresAdmin: true }
      ],
      newRoute: '/settings/payee/new',
      detailRoutePrefix: '/settings/payee/'
    }
  ];
}
