import { LogHistoryDto } from "./logHistoryDto";
import { ProductBarcodeDto } from "./productBarcodeDto";

export class ProductStockTakeDto {
    id?: number;
    sysFK_Invty?: number;
    qtyOnHand:number = 0;
    actualQty:number = 0;
    transDate = "";
}