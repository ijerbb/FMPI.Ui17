export class StockTakeSessionDto {
    id?: number | null;
    name?: string | null;
    warehouseID?: number | null;
    type?: number | null;
    status?: number | null;
    createdBy?: number | null;
    createdDate?: string | null;
    freezeTransactions?: boolean | null;
    notes?: string | null;
}
