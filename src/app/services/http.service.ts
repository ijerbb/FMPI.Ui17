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

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  // Change to Enum
  private action = "GetAllItems";
  private getProductAction = "GetProduct";
  private getProductAdvanceSearchAction = "GetProductsByAdvanceSearch"
  private isBarcodeExistAction = "IsBarcodeExist";
  private getProductInquiryAction = "GetProductInquiry";
  private patchProductAction = "PatchProduct";
  private recordStockTakeAction = "RecordProductStockTake";

  private getAllUsersAction = "AllUsers";
  private getUserById = "UserById";
  private patchUserAction = "PatchUser";
  private verifyLoginAction = "VerifyLogin";
  private logoutUserAction = "LogoutUser";

  constructor(private http: HttpClient) { }

  public getProducts(pageNo: number): Observable<ResponseListDto<ProductDto>>{
    return this.http.get<ResponseListDto<ProductDto>>(environment.apiUrl + '/Products/' + this.action + "?pageNum=" + pageNo);
  }

  public getProduct(barcode: string): Observable<ResponseListDto<ProductDto>>{
    return this.http.get<ResponseListDto<ProductDto>>(environment.apiUrl + '/Products/' + this.getProductAction + "?barcode=" + barcode);
  }

  public getProductAdvanceSearch(productSearchDto: ProductSearchDto): Observable<ResponseListDto<ProductDto>>{
    return this.http.get<ResponseListDto<ProductDto>>(environment.apiUrl + '/Products/' + this.getProductAdvanceSearchAction + "?partNo=" + productSearchDto.partNo + "&cDescription=" + productSearchDto.cDescription + "&brand=" + productSearchDto.brand + "&cCode=" + productSearchDto.cCode + "&application=" + productSearchDto.application + "&mainGroup=" + productSearchDto.mainGroup + "&aRef=" + productSearchDto.aRef);
  }

  public isBarcodeExist(barcode: string): Observable<ResponseDto>{
    return this.http.get<ResponseDto>(environment.apiUrl + '/Products/' + this.isBarcodeExistAction + "?barcode=" + barcode)
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

  public logoutUser(userDto: UserDto): Observable<ResponseDto> {
    return this.http.post<ResponseDto>(environment.apiUrl + '/Settings/' + this.logoutUserAction, userDto);
  }
}
