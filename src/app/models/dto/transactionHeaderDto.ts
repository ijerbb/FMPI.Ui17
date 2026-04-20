/**
 * Transaction Header DTO
 * Represents a transaction from Transaction_Header table
 * Note: Field names are camelCase to match API JSON response
 */
export class TransactionHeaderDto {
  /** System primary key */
  sysPK?: number;
  
  /** System foreign key account */
  sysFK_Account?: number;
  
  /** User primary key (document number) */
  userPK?: string;
  
  /** User foreign key branch */
  branch?: string;
  
  /** Account name */
  accountName?: string;
  
  /** Account code */
  accountCode?: string;
  
  /** Particulars/description */
  particulars?: string;
  
  /** Last updated by */
  lastUpdatedBy?: string;
  
  /** Last updated date */
  lastUpdatedDate?: Date | string;
  
  /** Transaction date */
  dateIssue?: Date | string;
  
  /** Module */
  module?: string;
  
  /** Module type */
  moduleType?: string;
  
  /** Total amount */
  totalAmount?: number;
  
  /** Total amount foreign */
  totalAmountForeign?: number;
  
  /** Status */
  status?: string;
  
  /** Type */
  type?: string;
  
  /** Posted flag */
  posted?: string;
  
  /** Voided flag */
  voided?: string;
  
  /** Prepared by */
  preparedBy?: string;
  
  /** Posted by */
  postedBy?: string;
}

/**
 * Transaction Ledger Item DTO
 */
export interface TransactionLedgerItemDto {
  sysPK_LdgrInvty?: number;
  sysFK_TransH?: number;
  sysFK_Invty?: number;
  userFK_Invty?: string;
  displayDescription?: string;
  baseUnitQtyIn?: number;
  baseUnitQtyOut?: number;
  baseUnitQtyReceivedBalance?: number;
  displayQtyIn?: number;
  displayQtyOut?: number;
  displayUnitSelling?: number;
  displayUnitPurchase?: number;
  displayUnitOfMeasure?: string;
  totalAmount?: number;
  particulars?: string;
  lastUpdatedDate?: Date | string;
}
