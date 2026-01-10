export class StockCountEntryDto {
    id?: number;
    taskId?: number;
    countNumber?: number = 0
    countedQty?: number;
    counterId?: number;
    timestamp?: string;
    notes?: string;
}
