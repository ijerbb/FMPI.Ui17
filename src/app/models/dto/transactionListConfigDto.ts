/**
 * Transaction List Configuration DTO
 * Defines the structure for configuring reusable transaction list views
 */

export interface BulkAction {
  /** Display text for the action */
  label: string;
  
  /** Action identifier (e.g., 'delete', 'export') */
  action: string;
  
  /** If true, requires ADMIN role (future implementation) */
  requiresAdmin?: boolean;
  
  /** Custom confirmation message */
  confirmMessage?: string;
}

export interface TransactionListConfig {
  /** Module type code (e.g., 'OTHERADJ', 'CSHINVC', 'CHGINVC') */
  moduleType: string;

  /** Display title for the page */
  title: string;

  /** Header icon class (Bootstrap icon) */
  headerIcon?: string;

  /** Search fields to display in basic search */
  searchFields?: string[];

  /** Advanced search fields with labels */
  advancedSearchFields?: AdvancedSearchField[];

  /** Columns to display in the list view */
  columns: TransactionColumn[];

  /** Available actions (new, edit, view, print, void, refresh) */
  actions?: string[];

  /** Route for creating new transaction */
  newRoute?: string;

  /** Route prefix for edit/view (e.g., '/transaction/otheradj/') */
  detailRoutePrefix?: string;

  /** Enable checkbox selection for bulk operations */
  enableBulkActions?: boolean;
  
  /** List of available bulk actions */
  bulkActions?: BulkAction[];
  
  /** Display name for the module */
  displayName?: string;
}

/**
 * Advanced search field configuration
 */
export interface AdvancedSearchField {
  /** Field key (matches API parameter) */
  key: string;
  
  /** Display label */
  label: string;
  
  /** Placeholder text */
  placeholder?: string;
  
  /** Field type (text, number, date, select) */
  type?: string;
  
  /** Options for select type */
  options?: SelectOption[];
}

/**
 * Select option for dropdown fields
 */
export interface SelectOption {
  value: any;
  label: string;
}

/**
 * Transaction column configuration
 */
export interface TransactionColumn {
  /** Column header text */
  header: string;

  /** Field name from transaction object (supports dot notation) */
  field: string;

  /** Field type for formatting (text, number, currency, date, json-preview) */
  type?: string;

  /** CSS class for header */
  headerClass?: string;

  /** CSS class for cells */
  cellClass?: string;

  /** Column width */
  width?: string;

  /** If true, field is clickable link to details */
  isLink?: boolean;
  
  /** If true, makes the field a clickable link (alternative to isLink) */
  clickable?: boolean;
  
  /** If true, shows JSON preview (truncated) */
  isJsonPreview?: boolean;
}

/**
 * Search criteria for transaction queries
 */
export interface TransactionSearchCriteria {
  /** Module type filter */
  moduleType?: string;
  
  /** Transaction number */
  userPK?: string;
  
  /** Account name */
  accountName?: string;
  
  /** Date range from */
  dateFrom?: string;
  
  /** Date range to */
  dateTo?: string;
  
  /** Branch filter */
  branch?: string;
  
  /** Status filter */
  status?: string;
  
  /** Particulars/description */
  particulars?: string;
  
  /** Additional dynamic fields */
  [key: string]: any;
}
