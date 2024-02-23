import { LogHistoryDto } from "./logHistoryDto";
import { ProductBarcodeDto } from "./productBarcodeDto";
import { ProductStockTakeDto } from "./productStockTakeDto";

export class ProductDto{
    id?: number;
    code = "";
    description = "";
    partNo = "";
    cDescription = "";
    brand = "";
    cCode = "";
    application = "";
    mainGroup = "";
    aRef = "";
    costCode = "";
    price = 0;

    invtyExtId?: number;
    warehouseNo = "";
    floorNo = "";
    shelfNo = "";
    rowNo = "";
    columnNo = "";

    qtyOnHand: number = 0;

    sessionGuid = "";
    barcodes: ProductBarcodeDto[] = [];
    stockTakes: ProductStockTakeDto[] = [];
    logs: LogHistoryDto[]  = [];
}