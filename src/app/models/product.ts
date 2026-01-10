import { LogHistory } from "./logHistory";
import { ProductBarcode } from "./productBarcode";
export class Product {
    id?: number;
    code = "";
    description = "";
    partno = "";
    cdescription = "";
    brand = "";
    ccode = "";
    application = "";
    maingroup = "";
    aref = "";
    suppliercode = "";
    warehouseno = "";
    floorno = "";
    shelfno = "";
    rowno = "";
    columnno = "";

    barcodes: ProductBarcode[] = [];
    logHistory:LogHistory[] = [];
}