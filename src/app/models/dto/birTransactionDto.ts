// BIR Transaction DTOs for BIR Posting (SLSP) feature

export class BirTransactionDto {
    id?: number | null;
    year?: string | null;
    period?: string | null;
    source?: string | null;
    taxType?: number | null;           // 0: Sales, 1: Purchases
    transNum?: string | null;
    name?: string | null;
    tinNo?: string | null;
    totalAmount?: number | null;
    totalTaxable?: number | null;
    taxAmount?: number | null;
    particulars?: string | null;
    dateTimeCreated?: string | null;
    createdBy?: string | null;
    isPosted?: boolean | null;
    isExempt?: boolean | null;
    
    // PDF Template Fields (for BIR Form 2307)
    registeredAddress?: string | null;
    zipCode?: string | null;
    
    // New Fields for BIR Summary Report (March 15, 2026)
    atcCode?: string | null;           // ATC Code (WC158, WC160)
    taxRateType?: string | null;       // 'VAT' or 'NON-VAT'
}

export class BirTransactionFilterDto {
    year?: string | null;
    period?: string | null;
    taxType?: number | null;           // 0: Sales, 1: Purchases
    pageNum?: number = 1;
    pageSize?: number = 10;
}

export class TransactionHeaderForBirDto {
    sysPK_TransH?: number | null;
    userPK_TransH?: string | null;
    accountName_TransH?: string | null;
    dateIssue_TransH?: string | null;
    module_TransH?: string | null;
    moduleType_TransH?: string | null;
    totalAmount_TransH?: number | null;
    tinNo?: string | null;
    particulars?: string | null;
}

export class RemoveTransactionRequest {
    id?: number | null;
}

export class AssignTransactionRequest {
    transactionHeaderId?: number | null;
    birTransactionId?: number | null;
}

// PDF Template Form Data Interface (for BIR Form 2307)
export interface BirSlspFormData {
    atcCode: string;
    // Derived from Period + Year
    periodFrom?: string | null;          // Format: MM DD YY (derived from Period first day)
    periodTo?: string | null;            // Format: MM DD YY (derived from Period last day)

    // Payor Information
    payorTinNo?: string | null;          // Format: 000 000 000 000 (from TinNo)
    payorName?: string | null;           // From Name field
    payorRegisteredAddress?: string | null;   // Registered Address
    payorZipCode?: string | null;             // Format: 0000

    // Payee Information
    payeeTinNo?: string | null;          // TIN Number
    payeeName?: string | null;           // Name
    payeeRegisteredAddress?: string | null;   // Registered Address
    payeeZipCode?: string | null;             // Format: 0000

    // Authorized Person Information
    authorizedPersonDesignation?: string | null;   // Designation
    authorizedPersonTitle?: string | null;         // Title
    authorizedPersonTIN?: string | null;           // TIN Number

    // Derived from amounts
    firstMonthAmount?: number | null;    // TotalTaxable / 3
    secondMonthAmount?: number | null;   // TotalTaxable / 3
    thirdMonthAmount?: number | null;    // TotalTaxable / 3
    totalTaxable?: number | null;        // TotalTaxable amount
    totalTaxWithheld?: number | null;    // TotalTaxWithheld amount
    grandTotal?: number | null;          // From TotalTaxable
    taxWithheldTotal?: number | null;    // From TaxAmount
    monthTotal?: number | null;          // Gross Total / TotalAmount
    taxWithheld?: number | null;         // Tax withheld for the month
    totalAmount?: number | null;         // Gross Total

    // Metadata
    year?: string | null;
    period?: string | null;              // 01-12
    ATCCode?: string | null;             // ATC Code (WC158, WC160)
    taxType?: number | null;             // 0: Sales, 1: Purchases
    transNum?: string | null;
    source?: string | null;
    dateTimeCreated?: string | null;
}

// Summary Report DTOs (March 15, 2026)
export class BirTransactionSummaryDto {
    rowNumber?: number;
    vendorName?: string;
    tinNo?: string;
    totalAmount?: number;
    taxWithheld?: number;
    atcCode?: string;
    taxRateType?: string;
}

export class BirTransactionSummaryReportDto {
    companyName?: string;
    reportTitle?: string;
    year?: string;
    period?: string;
    records?: BirTransactionSummaryDto[];
    totalGrossAmount?: number;
    totalTaxWithheld?: number;
}

export class BirTransactionSaveDto {
    transactionHeaderIds?: number[];
    year?: string;
    period?: string;
    taxType?: number;
    atcCode?: string | null;
    taxRateType?: string | null;
}

export class ExistingTransactionDto {
    sysPK_TransH?: number;
    exists?: boolean;
}
