import { Component, OnInit } from '@angular/core';
import { productInquiryDto } from '../../../models/dto/productInquiryDto';
import { HttpService } from '../../../services/http.service';
import { CommonModule, formatNumber } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-inquiry',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-inquiry.component.html',
  styleUrls: ['../../settings/main/main.component.css', './product-inquiry.component.css']
})
export class ProductInquiryComponent implements OnInit{
  barcodeStr:string = "";
  partNo: string = "";
  cDesc: string = "";
  brand: string = "";
  cCode: string = "";
  application: string = "";
  mainGroup: string = "";
  aRef: string = "";
  costCode: string = "";
  price : string = "";
  qtyOnHand:number = 0;
  isScanSuccess: boolean = false;

  pageStart = 1;
  pageEnd = 2;
  pageNum = 1;
  totalRecords = 0;
  pageNoList: number[] = [];
  productInquiries : productInquiryDto[] = [];
  // allowedFormats = [ BarcodeFormat.QR_CODE, BarcodeFormat.CODE_128, BarcodeFormat.EAN_13];  
  
  constructor(private httpService: HttpService) { }

  ngOnInit(): void {
  }

  onCodeResult(result: string){
    this.barcodeStr = result;

    this.getHistory(1);
    
    document.getElementById("modalClose")?.click();
  }

  getHistory(pageNo: number){
    this.productInquiries = [];
    this.pageStart = 0;
    this.pageEnd = 0;
    this.pageNum = 0;
    this.totalRecords = 0;
    this.isScanSuccess = false;
    if(this.barcodeStr != "") {
      this.httpService.getProductInquiry(this.barcodeStr, pageNo).subscribe(result=>{
        this.qtyOnHand = 0;
        this.isScanSuccess = result.totalRecords > 0;
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
        result.details.forEach(value=>{
          let prodInq: productInquiryDto = new productInquiryDto();
          prodInq.moduleType = value.moduleType;
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

  searchBarcode() {
    this.onCodeResult(this.barcodeStr);
  }

  clickPage(pageNo:number){
    
    if(this.pageEnd >= pageNo && (pageNo>=this.pageStart)) {
      console.log(pageNo);
      this.getHistory(pageNo);
    }
      
  }

  clearBarcodeStr(){
    this.barcodeStr = '';
    this.getHistory(1);
  }
}
