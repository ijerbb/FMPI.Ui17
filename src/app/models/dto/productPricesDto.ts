export class ProductPricesDto{
    id: number = 0;
    code = "";
    description = "";
    partNo = "";
    cDescription = "";
    brand = "";
    cCode = "";
    application = "";
    mainGroup = "";
    aRef = "";
    fId?: number;
    costCode = "";
    cost: number = 0;
    previousCost = 0;
    price = 0;
    previousPrice = 0;
    effectiveDate: Date = new Date();
}