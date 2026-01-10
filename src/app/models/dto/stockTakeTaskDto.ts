import { ProductDto } from './productDto';

export class StockTakeTaskDto {
    id?: number;
    sessionId?: number;
    productId?: number;
    locationId?: string;
    expectedQty?: number;
    assignedTo?: number;
    status?: string;
    stockCount?: number;
    productDto?: ProductDto;
}
