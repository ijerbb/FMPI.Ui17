import { Component, OnInit } from '@angular/core';
import { productInquiryDto } from '../../../models/dto/productInquiryDto';
import { HttpService } from '../../../services/http.service';
import { CommonModule, formatNumber } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductSearchDto } from '../../../models/dto/productSearchDto';
import { ProductPricesDto } from '../../../models/dto/productPricesDto';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ResponseListDto } from '../../../models/dto/responseListDto';
import { PaginationComponent } from '../../shared/pagination/pagination.component';

@Component({
  selector: 'app-product-inquiry',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PaginationComponent],
  templateUrl: './product-inquiry.component.html',
  styleUrls: [
    '../../settings/main/main.component.css',
    './product-inquiry.component.css',
    '../../shared/detail/detail.component.css'
  ]
})
export class ProductInquiryComponent implements OnInit{
  barcodeStr:string = "";
  partNoS: string = "";
  cDescS: string = "";
  brandS: string = "";
  cCodeS: string = "";
  applicationS: string = "";
  mainGroupS: string = "";
  aRefS: string = "";
  
  partNo: string = "";
  cDesc: string = "";
  brand: string = "";
  cCode: string = "";
  application: string = "";
  mainGroup: string = "";
  aRef: string = "";
  costCode: string = "";
  price : string = "";
  effectiveDate: string = "";
  qtyOnHand:number = 0;
  isScanSuccess: boolean = false;
  isSearchSuccess: boolean = false;
  isMultipleItem: boolean = false;
  isItemSelected: boolean = false;

  listPageStart = 1;
  listPageEnd = 2;
  listPageNum = 1;
  listTotalRecords = 0;
  listPageNoList: number[] = [];

  pageStart = 1;
  pageEnd = 2;
  pageNum = 1;
  totalRecords = 0;
  pageNoList: number[] = [];
  productInquiries : productInquiryDto[] = [];
  productPricesList: ProductPricesDto[] = [];
  // allowedFormats = [ BarcodeFormat.QR_CODE, BarcodeFormat.CODE_128, BarcodeFormat.EAN_13];  
  
  constructor(private httpService: HttpService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')?.toString();
    this.onCodeResult(this.route.snapshot.paramMap.get('id')??"");
  }

  onCodeResult(result: string){
    this.barcodeStr = result;

    this.getHistory(1);
  }

  getHistory(pageNo: number){
    this.productInquiries = [];
    this.isScanSuccess = false;
    if(this.barcodeStr != "") {
      this.httpService.getProductInquiry(this.barcodeStr, pageNo).subscribe(result=>{
        this.qtyOnHand = 0;
        this.isItemSelected = true;
        this.isSearchSuccess = true;
        this.isScanSuccess = result.header != null;
        this.pageStart = result.pageStart;
        this.pageEnd = result.pageEnd;
        this.pageNum = result.pageNum;
        this.totalRecords = result.totalRecords;
        var tempPageStart = this.pageStart;
        this.pageNoList =  Array((this.pageEnd + 1)- this.pageStart).fill(this.pageStart).map((x, i) => tempPageStart++);
        this.partNo = result.header.partNo;
        this.cDesc = result.header.cDescription;
        this.brand = result.header.brand;
        this.cCode = result.header.cCode;
        this.application = result.header.application;
        this.mainGroup = result.header.mainGroup;
        this.aRef = result.header.aRef;
        this.costCode = result.header.costCode;
        this.price = formatNumber(result.header.price,"en-IN", "1.2-2");
        const date = new Date(result.header.effectiveDate);
        const formattedDate: string = new Intl.DateTimeFormat(undefined, {
          year: "numeric",
          month: "2-digit",
          day: "2-digit"
        }).format(date);

        this.effectiveDate = formattedDate;
        result.details.forEach(value=>{
          let prodInq: productInquiryDto = new productInquiryDto();
          prodInq.moduleType = value.moduleType;
          prodInq.moduleTypeName = value.moduleTypeName || value.moduleType;
          prodInq.transDate =  value.transDate;
          prodInq.transNum = value.transNum;
          prodInq.transName = value.transName;
          prodInq.qtyIn = value.qtyIn;
          prodInq.qtyOut = value.qtyOut;
          prodInq.qtyOnHand = value.qtyOnHand;
          this.qtyOnHand = prodInq.qtyOnHand; //this.qtyOnHand + (value.qtyIn - value.qtyOut);
          this.productInquiries.push(prodInq);
        });
      }, error => console.error(error));
    }
  }

  clickPage(pageNo:number){
    if(this.pageEnd >= pageNo && (pageNo>=this.pageStart)) {
      this.getHistory(pageNo);
    }
  }

  onPageChange(pageNo: number): void {
    this.getHistory(pageNo);
  }
}
