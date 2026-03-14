export class TransactionHistoryDto {
    sysPK_TransH?: number;
    dateIssue?: string;
    moduleType?: string;
    moduleTypeName?: string;
    userPK?: string;
    baseQtyIn?: number;
    baseQtyOut?: number;
    runningBalance?: number;
}
