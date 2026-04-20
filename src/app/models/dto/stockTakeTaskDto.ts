import { ProductDto } from './productDto';
import { StockCountEntryDto } from './stockCountEntryDto';
import { TransactionHistoryDto } from './transactionHistoryDto';
import { ProductCostInfoDto } from './productCostInfoDto';

export class StockTakeTaskDto {
    id?: number;
    sessionId?: number;
    productId?: number;
    productDescription?: string;
    locationId?: string;
    expectedQty?: number;
    assignedTo?: number;
    status?: string;
    lastUpdated?: string;
    stockCount?: number;
    productDto?: ProductDto;
    productCostInfo?: ProductCostInfoDto;

    // Total count of stock count entries without assignedTo filter
    totalStockCountEntries?: number;
    // List of stock count entries ordered by timestamp
    stockCountEntries?: StockCountEntryDto[];
    // List of transaction history for the product (1 year before current date)
    transactionHistory?: TransactionHistoryDto[];
    
    // Indicates if no adjusting entry was created because counted qty matched expected qty
    noAdjustmentNeeded?: boolean;
    // Message explaining why no adjustment was created
    noAdjustmentMessage?: string;
}
