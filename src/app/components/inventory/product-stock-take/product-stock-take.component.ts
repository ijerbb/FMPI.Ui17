import { Component, OnInit } from '@angular/core';
import { ProductDto } from '../../../models/dto/productDto';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpService } from '../../../services/http.service';
import { Product } from '../../../models/product';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-stock-take',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './product-stock-take.component.html',
  styleUrls: ['../../settings/main/main.component.css', './product-stock-take.component.css']
})
export class ProductStockTakeComponent implements OnInit {
  products : ProductDto[] = [];
  resultString: string = "";
  resultProductDescription: string = "";

  inputText: string = "";
  barcodeStr:string = "";
  pageStart = 1;
  pageEnd = 2;
  pageNum = 1;
  totalRecords = 0;
  pageNoList: number[] = [];
  isScanSuccess: boolean = false;

  datePipe = new DatePipe('en-US'); 

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
      
    }, (error: any) => console.error(error));
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

  clearBarcodeStr(){
    this.barcodeStr = '';
    this.loadList(1);
  }
}
