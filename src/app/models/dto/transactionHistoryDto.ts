export class TransactionHistoryDto {
    sysPK_TransH?: number;
    dateIssue?: string;
    moduleType?: string;
    moduleTypeName?: string;
    userPK?: string;
    accountDocumentNum?: string;
    baseQtyIn?: number;
    baseQtyOut?: number;
    runningBalance?: number;
    
    /**
     * Indicates if this transaction is an adjusting entry created from Stock Take
     */
    isStockTakeAdjustment?: boolean;
    
    /**
     * Stock Take Session ID if this is a stock take adjustment
     */
    stockTakeSessionId?: number;
    
    /**
     * Stock Take Task ID if this is a stock take adjustment
     */
    stockTakeTaskId?: number;
}
