import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../../services/http.service';
import { Product } from '../../../models/product';
import { ProductDto } from '../../../models/dto/productDto';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductSearchDto } from '../../../models/dto/productSearchDto';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './product.component.html',
  styleUrls: ['../../settings/main/main.component.css','./product.component.css']
})
export class ProductComponent implements OnInit{
  products : ProductDto[] = [];
  resultString: string = "";
  resultProductDescription: string = "";
  //allowedFormats = [ BarcodeFormat.QR_CODE, BarcodeFormat.CODE_128, BarcodeFormat.EAN_13];

  inputText: string = "";
  barcodeStr:string = "";
  partNo: string = "";
  cDescription: string = "";
  brand: string = "";
  cCode: string = "";
  application: string = "";
  mainGroup: string = "";
  aRef: string = "";
  pageStart = 1;
  pageEnd = 2;
  pageNum = 1;
  totalRecords = 0;
  pageNoList: number[] = [];
  isScanSuccess: boolean = false;

  constructor(private httpService: HttpService) { }

  ngOnInit(): void {
    this.loadList(1);
  }

  loadList(pageNo: number){
    this.products = [];
    this.httpService.getProducts(pageNo).subscribe(result => {
      this.pageStart = result.pageStart;
      this.pageEnd = result.pageEnd;
      this.pageNum = result.pageNum;
      this.totalRecords = result.totalRecords;
      var tempPageStart = this.pageStart;
      this.pageNoList =  Array((this.pageEnd + 1)- this.pageStart).fill(this.pageStart).map((x, i) => tempPageStart++);
      this.products = result.lists;

      // result.lists.forEach((value:ProductDto) => {
      //   let product: Product  = new Product();
      //   product.id = value. sysPK_Invty;
      //   product.code = value.userPK_Invty;
      //   product.description = value.description_Invty;
      //   product.partno  = value.model_Invty;
      //   product.cdescription = value.subCategory_Invty;
      //   product.brand = value.brand_Invty;
      //   product.ccode = value.speed_Invty;
      //   product.application = value.style_Invty;
      //   product.maingroup = value.category_Invty;
      //   product.aref = value.classification_Invty;
      //   this.products.push(product);
      // })
    }, error => console.error(error));
  }

  clickPage(pageNo:number){
    this.loadList(pageNo);
  }

  clearResult(){
    this.resultString = "";
    this.resultProductDescription = "";
    this.inputText = "";
  }

  searchBarcode() {
    if(this.barcodeStr != "") {
      this.getProduct(this.barcodeStr);
    } else {
      this.loadList(1);
    }
  }

  onCodeResult(result: string){ 
    if(result != ""){
      this.getProduct(result);
    } else {
      this.loadList(1);
    }
    
    document.getElementById("modalClose")?.click();
  }

  private getProduct(id:string){
    this.httpService.getProduct(id).subscribe(result => {
      if(result.totalRecords > 0 && result.lists != null) {
        this.pageStart = result.pageStart;
        this.pageEnd = result.pageEnd;
        this.pageNum = result.pageNum;
        this.totalRecords = result.totalRecords;
        let product: Product  = new Product();
        var tempPageStart = this.pageStart;
        this.pageNoList =  Array((this.pageEnd + 1)- this.pageStart).fill(this.pageStart).map((x, i) => tempPageStart++);
        this.products = [];
        this.products.push(result.lists[0]);
      } else {
        this.products = [];
      }
    });
  }

  private getProductAdvSearch()
  {
    let productSearchDto: ProductSearchDto = {
      partNo : this.partNo,
      cDescription: this.cDescription,
      brand: this.brand,
      cCode: this.cCode,
      application: this.application,
      mainGroup: this.mainGroup,
      aRef: this.aRef
    }
    this.httpService.getProductAdvanceSearch(productSearchDto).subscribe(result => {
      this.pageStart = result.pageStart;
      this.pageEnd = result.pageEnd;
      this.pageNum = result.pageNum;
      this.totalRecords = result.totalRecords;
      var tempPageStart = this.pageStart;
      this.pageNoList =  Array((this.pageEnd + 1)- this.pageStart).fill(this.pageStart).map((x, i) => tempPageStart++);
      this.products = result.lists;
    }, error => console.error(error));
  }

  clearBarcodeStr(){
    this.barcodeStr = '';
    this.loadList(1);
  }

  advanceSearch(){
    this.getProductAdvSearch();
  }

  // onCodeResult(result: string){
  //   this.resultString = result;
  //   this.httpService.getProduct(result).subscribe(res => {
  //     this.resultProductDescription = res.description_Invty;
  //   }, error => {
  //     this.resultProductDescription = JSON.stringify(error);
  //   }
  //   );
  // }

  // manualSearch(){
  //   console.log(this.inputText);
  //   this.httpService.getProduct(this.inputText).subscribe(result => {
  //     console.log(result);
  //     if(result!=null)
  //     this.resultProductDescription = result.description_Invty;
  //   }, error => {
  //     this.resultProductDescription = JSON.stringify(error);
  //   });
  // }
}
