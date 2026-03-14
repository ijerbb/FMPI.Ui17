export class StockCountEntryDto {
    id?: number;
    taskId?: number;
    countNumber?: number = 0
    countedQty?: number;
    counterId?: number;
    counterName?: string;
    timestamp?: string;
    notes?: string;
    overridePassword?: string;
    expectedQty?: number;
    adjustQty?: number;
}
