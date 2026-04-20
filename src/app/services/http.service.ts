import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ResponseListDto } from '../models/dto/responseListDto';
import { Observable } from 'rxjs/internal/Observable';
import { ProductDto } from '../models/dto/productDto';
import { environment } from '../../environments/environment';
import { ResponseDto } from '../models/dto/responseDto';
import { ProductStockTakeDto } from '../models/dto/productStockTakeDto';
import { UserDto } from '../models/dto/userDto';
import { ProductSearchDto } from '../models/dto/productSearchDto';
import { Product } from '../models/product';
import { ResponseTransDto } from '../models/dto/responseTransDto';
import { ProductPricesDto } from '../models/dto/productPricesDto';
import { productInquiryDto } from '../models/dto/productInquiryDto';
import { ProductBarcode } from '../models/productBarcode';
import { ProductBarcodeDto } from '../models/dto/productBarcodeDto';
import { StockTakeSessionDto } from '../models/dto/stockTakeSessionDto';
import { StockTakeTaskDto } from '../models/dto/stockTakeTaskDto';
import { StockCountEntryDto } from '../models/dto/stockCountEntryDto';
import { map } from 'rxjs';
import { MenusDto } from '../models/dto/menusDto';
import { TransactionHistoryDto } from '../models/dto/transactionHistoryDto';
import { DatabaseConfig } from '../models/dto/databaseConfig';
import { BirTransactionDto, RemoveTransactionRequest, TransactionHeaderForBirDto, BirTransactionFilterDto } from '../models/dto/birTransactionDto';
import { TransactionHeaderDto } from '../models/dto/transactionHeaderDto';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  // Change to Enum
  private action = "GetAllItems";
  private getProductAction = "GetProduct";
  private getProductAdvanceSearchAction = "GetProductsByAdvanceSearch"
  private getProductAdvancedSearchAction = "GetProductsByAdvancedSearch"
  private isBarcodeExistAction = "IsBarcodeExist";
  private excludeBarcodeAction = "ExcludeBarcode";
  private getProductInquiryAction = "GetProductInquiry";
  private patchProductAction = "PatchProduct";
  private recordStockTakeAction = "RecordProductStockTake";
  private listStockTakeSessionsAction = "ListSessions";
  private createStockTakeSessionsAction = "CreateSession";
  private updateStockTakeSessionsAction = "UpdateSession";
  private getTasksBySessionAction = "GetTasksBySession";
  private recordStockCountEntryAction = "RecordCountEntry";
  private getCountsByTaskAction = "GetCountsByTask";
  private getTaskBySessionProductAction = "GetTaskBySessionAndProductAndUserId";
  private createStockTakeTaskAction = "AddTask";
  private updateStockTakeTaskAction = "UpdateTask";
  private countTasksBySessionAction = "CountTasksBySession";
  private syncActualInventoryAction = "SyncActualInventory";
  private getUserIdAction = "GetUserId";

  private getAllUsersAction = "AllUsers";
  private getUserById = "UserById";
  private patchUserAction = "PatchUser";
  private verifyLoginAction = "VerifyLogin";
  private verifyAccessRightsAction = "VerifyAccessRights";
  private verifyOverrideAction = "VerifyOverride";
  private getMenusAction = "GetMenus";
  private logoutUserAction = "LogoutUser";
  private getAvailableDatabasesAction = "GetAvailableDatabases";
  private getSessionInfoAction = "GetSessionInfo";
  private switchDatabaseAction = "SwitchDatabase";

  constructor(private http: HttpClient) { }

  public getProducts(pageNo: number): Observable<ResponseListDto<ProductDto>>{
    return this.http.get<ResponseListDto<ProductDto>>(environment.apiUrl + '/Products/' + this.action + "?pageNum=" + pageNo);
  }

  public getProductByBarcode(barcode: string): Observable<ResponseListDto<ProductDto>>{
    return this.http.get<ResponseListDto<ProductDto>>(environment.apiUrl + '/Products/' + this.getProductAction + "?barcode=" + barcode);
  }

  public getProduct(productSearchDto: ProductSearchDto): Observable<ResponseListDto<ProductDto>>{
    return this.http.post<ResponseListDto<ProductDto>>(environment.apiUrl + '/Products/' + this.getProductAction, productSearchDto);
  }

  public getProductAdvanceSearch(productSearchDto: ProductSearchDto): Observable<ResponseListDto<ProductDto>>{
    return this.http.get<ResponseListDto<ProductDto>>(environment.apiUrl + '/Products/' + this.getProductAdvanceSearchAction + "?partNo=" + productSearchDto.partNo + "&cDescription=" + productSearchDto.cDescription + "&brand=" + productSearchDto.brand + "&cCode=" + productSearchDto.cCode + "&application=" + productSearchDto.application + "&mainGroup=" + productSearchDto.mainGroup + "&aRef=" + productSearchDto.aRef);
  }

  public getProductAdvancedSearch(productSearchDto: ProductSearchDto): Observable<ResponseListDto<ProductPricesDto>>{
    return this.http.post<ResponseListDto<ProductPricesDto>>(environment.apiUrl + '/Products/' + this.getProductAdvancedSearchAction, productSearchDto);
  }

  public getProductBySearch(searchTerm: string, pageNo: number = 1): Observable<ResponseListDto<ProductPricesDto>>{
    return this.http.get<ResponseListDto<ProductPricesDto>>(environment.apiUrl + '/Products/GetProductsBySearch?searchTerm=' + encodeURIComponent(searchTerm) + '&pageNo=' + pageNo);
  }

  public isBarcodeExist(barcode: string): Observable<ResponseDto>{
    return this.http.get<ResponseDto>(environment.apiUrl + '/Products/' + this.isBarcodeExistAction + "?barcode=" + barcode)
  }

  public excludeBarcode(productBarcodeDto: ProductBarcodeDto): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.put<any>(environment.apiUrl + '/Products/' + this.excludeBarcodeAction,  productBarcodeDto, httpOptions);
  }

  public getProductInquiry(barcode: string, pageNo: number): Observable<ResponseTransDto<ProductPricesDto, productInquiryDto>>{
    return this.http.get<ResponseTransDto<ProductPricesDto, productInquiryDto>>(environment.apiUrl + '/Products/' + this.getProductInquiryAction + "?barcode=" + barcode + "&PageNo=" + pageNo);
  }

  public patchProduct(prodDto: ProductDto): Observable<any> {
    return this.http.patch(environment.apiUrl + '/Products/' + this.patchProductAction, prodDto);
  }

  public recordStockTake(prodStockTakeDto: ProductStockTakeDto): Observable<any> {
    return this.http.patch(environment.apiUrl + '/Products/' + this.recordStockTakeAction, prodStockTakeDto);
  }

  public listStockTakeSessions(pageNo: number = 1): Observable<ResponseListDto<StockTakeSessionDto>> {
    return this.http.get<ResponseListDto<StockTakeSessionDto>>(environment.apiUrl + '/Inventory/' + this.listStockTakeSessionsAction + "?pageNum=" + pageNo);
  }

  public getTasksBySession(sessionId: number, pageNo: number = 1): Observable<ResponseListDto<StockTakeTaskDto>> {
    return this.http.get<ResponseListDto<StockTakeTaskDto>>(environment.apiUrl + '/Inventory/' + this.getTasksBySessionAction + '?sessionId=' + sessionId + '&pageNum=' + pageNo);
  }

  public getTasksBySessionAndStatus(sessionId: number, status: string, pageNo: number = 1): Observable<ResponseListDto<StockTakeTaskDto>> {
    return this.http.get<ResponseListDto<StockTakeTaskDto>>(environment.apiUrl + '/Inventory/GetTasksBySessionAndStatus?sessionId=' + sessionId + '&status=' + encodeURIComponent(status) + '&pageNum=' + pageNo);
  }

  public getTaskBySessionAndProduct(sessionId: number, productId: number): Observable<StockTakeTaskDto> {
    return this.http.get<StockTakeTaskDto>(environment.apiUrl + '/Inventory/' + this.getTaskBySessionProductAction + '?sessionId=' + sessionId + '&productId=' + productId);
  }

  public getTaskBySessionAndProductAndUserId(sessionId: number, productId: number, userId: number): Observable<StockTakeTaskDto> {
    return this.http.get<StockTakeTaskDto>(environment.apiUrl + '/Inventory/' + this.getTaskBySessionProductAction + '?sessionId=' + sessionId + '&productId=' + productId + '&userId=' + userId);
  }

  public getUserId(token: string) : Observable<ResponseDto> {
    return this.http.get<ResponseDto>(environment.apiUrl + '/Settings/' + this.getUserIdAction + '?token=' + token);
  }

  public createStockTakeTask(dto: any): Observable<StockTakeTaskDto> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<StockTakeTaskDto>(environment.apiUrl + '/Inventory/' + this.createStockTakeTaskAction, dto, httpOptions);
  }

  public countTasksBySession(sessionId: number): Observable<ResponseDto> {
    return this.http.get<ResponseDto>(environment.apiUrl + '/Inventory/' + this.countTasksBySessionAction + '?sessionId=' + sessionId);
  }

  public getTaskValuesBySession(sessionId: number): Observable<ResponseDto> {
    return this.http.get<ResponseDto>(environment.apiUrl + '/Inventory/GetTaskValuesBySession?sessionId=' + sessionId);
  }

  public recordStockCountEntry(dto: StockCountEntryDto): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post(environment.apiUrl + '/Inventory/' + this.recordStockCountEntryAction, dto, httpOptions);
  }

  public getCountsByTask(taskId: number): Observable<ResponseListDto<StockCountEntryDto>> {
    return this.http.get<ResponseListDto<StockCountEntryDto>>(environment.apiUrl + '/Inventory/' + this.getCountsByTaskAction + '?taskId=' + taskId);
  }

  public getTaskById(taskId: number): Observable<StockTakeTaskDto> {
    return this.http.get<StockTakeTaskDto>(environment.apiUrl + '/Inventory/GetTaskById?taskId=' + taskId);
  }

  public createStockTakeSession(dto: StockTakeSessionDto): Observable<any> {
    return this.http.post(environment.apiUrl + '/Inventory/' + this.createStockTakeSessionsAction, dto);
  }

  public updateStockTakeSession(dto: StockTakeSessionDto): Observable<any> {
    return this.http.put(environment.apiUrl + '/Inventory/' + this.updateStockTakeSessionsAction, dto);
  }

  public updateStockTakeTask(dto: StockTakeTaskDto): Observable<ResponseDto> {
    return this.http.patch<ResponseDto>(environment.apiUrl + '/Inventory/' + this.updateStockTakeTaskAction, dto);
  }

  public confirmCountAndCreateAdjustment(taskId: number, userId: number): Observable<ResponseDto> {
    return this.http.post<ResponseDto>(
      environment.apiUrl + '/Inventory/ConfirmCountAndCreateAdjustment?taskId=' + taskId + '&userId=' + userId,
      {}
    );
  }

  public batchCreateMissingAdjustments(sessionId: number, userId: number): Observable<ResponseDto> {
    return this.http.post<ResponseDto>(
      environment.apiUrl + '/Inventory/BatchCreateMissingAdjustments?sessionId=' + sessionId + '&userId=' + userId,
      {}
    );
  }

  public getAllUsers() {
    return this.http.get<UserDto[]>(environment.apiUrl + '/Settings/' + this.getAllUsersAction);
  }

  public getUser(id:number) {
    return this.http.get<UserDto>(environment.apiUrl + '/Settings/' + this.getUserById + '?id=' + id);
  }

  public patchUser(userDto: UserDto): Observable<any> {
    return this.http.patch(environment.apiUrl + '/Settings/' + this.patchUserAction, userDto);
  }

  public verifyLogin(userDto: UserDto): Observable<ResponseDto> {
    return this.http.post<ResponseDto>(environment.apiUrl + '/Settings/' + this.verifyLoginAction, userDto);
  }

  public verifyAccessRights(token:string, userAccess:string): Observable<ResponseDto> {
    return this.http.get<ResponseDto>(environment.apiUrl + '/Settings/' + this.verifyAccessRightsAction + '?token=' + token + '&userAccess=' + userAccess);
  }

  public getTransactionHistoryByProductId(productId: number): Observable<TransactionHistoryDto[]> {
    return this.http.get<TransactionHistoryDto[]>(environment.apiUrl + '/Inventory/GetTransactionHistoryByProductId?productId=' + productId);
  }

  public verifyOverride(password:string): Observable<ResponseDto> {
    return this.http.get<ResponseDto>(environment.apiUrl + '/Settings/' + this.verifyOverrideAction + '?requestData=' + password);
  }

  public getMenus(token:string): Observable<ResponseDto> {
    return this.http.get<ResponseDto>(environment.apiUrl + '/Settings/' + this.getMenusAction + '?token=' + token);
  }

  public logoutUser(userDto: UserDto): Observable<ResponseDto> {
    return this.http.post<ResponseDto>(environment.apiUrl + '/Settings/' + this.logoutUserAction, userDto);
  }

  public syncActualInventory(sessionId: number, userId?: number): Observable<ResponseDto> {
    let url = environment.apiUrl + '/Inventory/' + this.syncActualInventoryAction + '?sessionId=' + sessionId;
    if (userId !== undefined && userId !== null) {
      url += '&userId=' + userId;
    }
    return this.http.post<ResponseDto>(url, {});
  }

  public getAvailableDatabases(): Observable<ResponseDto> {
    return this.http.get<ResponseDto>(environment.apiUrl + '/Settings/' + this.getAvailableDatabasesAction);
  }

  public getSessionInfo(token: string): Observable<ResponseDto> {
    return this.http.get<ResponseDto>(environment.apiUrl + '/Settings/' + this.getSessionInfoAction + '?token=' + token);
  }

  public switchDatabase(userDto: UserDto): Observable<ResponseDto> {
    return this.http.post<ResponseDto>(environment.apiUrl + '/Settings/' + this.switchDatabaseAction, userDto);
  }

  // BIR Posting Methods
  public getBirTransactions(filter: any): Observable<ResponseListDto<BirTransactionDto>> {
    return this.http.post<ResponseListDto<BirTransactionDto>>(environment.apiUrl + '/BirPosting/GetBirTransactions', filter);
  }

  public removeBirTransaction(request: RemoveTransactionRequest): Observable<ResponseDto> {
    return this.http.post<ResponseDto>(environment.apiUrl + '/BirPosting/RemoveBirTransaction', request);
  }

  public postBirTransactions(transactionIds: number[]): Observable<ResponseDto> {
    return this.http.post<ResponseDto>(environment.apiUrl + '/BirPosting/PostBirTransactions', transactionIds);
  }

  public getTransactionHeadersByModuleType(moduleType: string, pageNum: number, year?: string | null, period?: number | null): Observable<ResponseListDto<TransactionHeaderForBirDto>> {
    let url = environment.apiUrl + '/BirPosting/GetTransactionHeadersByModuleType?moduleType=' + moduleType + '&pageNum=' + pageNum;
    if (year) url += '&year=' + year;
    if (period) url += '&period=' + period;
    return this.http.get<ResponseListDto<TransactionHeaderForBirDto>>(url);
  }

  public getBirTransactionTotals(filter: BirTransactionFilterDto): Observable<any> {
    return this.http.post(environment.apiUrl + '/BirPosting/GetBirTransactionTotals', filter);
  }

  // Summary Report Methods (March 15, 2026)
  public getBirTransactionSummaryReport(filter: BirTransactionFilterDto): Observable<any> {
    return this.http.post(environment.apiUrl + '/BirPosting/GetBirTransactionSummaryReport', filter);
  }

  public checkExistingTransactionHeaders(year: string, period: string, taxType: number): Observable<any> {
    return this.http.get(environment.apiUrl + '/BirPosting/CheckExistingTransactionHeaders?year=' + year + '&period=' + period + '&taxType=' + taxType);
  }

  public saveTransactionsToBir(saveDto: any): Observable<any> {
    return this.http.post(environment.apiUrl + '/BirPosting/SaveTransactionsToBir', saveDto);
  }

  public addBirTransaction(addDto: any): Observable<any> {
    return this.http.post(environment.apiUrl + '/BirPosting/AddBirTransaction', addDto);
  }

  // Generic Transaction Methods (for reusable transaction list)
  public getTransactionsByModuleType(moduleType: string, pageNum: number, pageSize: number, criteria?: any): Observable<ResponseListDto<TransactionHeaderDto>> {
    if (criteria && Object.keys(criteria).length > 0) {
      // Use POST endpoint for search criteria
      const url = environment.apiUrl + '/Transactions/GetByModuleTypeWithCriteria';
      const body = {
        moduleType: moduleType,
        pageNum: pageNum,
        pageSize: pageSize,
        criteria: criteria
      };
      return this.http.post<ResponseListDto<TransactionHeaderDto>>(url, body);
    } else {
      // Use GET endpoint when no criteria
      const url = environment.apiUrl + '/Transactions/GetByModuleType?moduleType=' + moduleType + '&pageNum=' + pageNum + '&pageSize=' + pageSize;
      return this.http.get<ResponseListDto<TransactionHeaderDto>>(url);
    }
  }

  public getTransactionById(id: number): Observable<ResponseDto> {
    return this.http.get<ResponseDto>(environment.apiUrl + '/Transactions/GetDetail?id=' + id);
  }

  public createTransaction(transactionDto: any): Observable<ResponseDto> {
    return this.http.post<ResponseDto>(environment.apiUrl + '/Transactions/Create', transactionDto);
  }

  public updateTransaction(transactionDto: any): Observable<ResponseDto> {
    return this.http.post<ResponseDto>(environment.apiUrl + '/Transactions/Update', transactionDto);
  }

  public voidTransaction(id: number, reason?: string): Observable<ResponseDto> {
    const url = environment.apiUrl + '/Transactions/Void?id=' + id + (reason ? '&reason=' + reason : '');
    return this.http.post<ResponseDto>(url, null);
  }

  public printTransaction(id: number): Observable<Blob> {
    return this.http.get(environment.apiUrl + '/Transactions/Print?id=' + id, { responseType: 'blob' });
  }
}
