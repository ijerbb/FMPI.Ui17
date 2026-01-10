import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../../services/http.service';
import { Product } from '../../../models/product';
import { ProductDto } from '../../../models/dto/productDto';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductSearchDto } from '../../../models/dto/productSearchDto';
import { StateService } from '../../../services/state.service';
import { ResponseListDto } from '../../../models/dto/responseListDto';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './product.component.html',
  styleUrls: ['../../settings/main/main.component.css','./product.component.css']
})
export class ProductComponent implements OnInit{
  resultString: string = "";
  resultProductDescription: string = "";
  productsList: any = null;
  //allowedFormats = [ BarcodeFormat.QR_CODE, BarcodeFormat.CODE_128, BarcodeFormat.EAN_13];

  inputText: string = "";
  headerText: string = "";
  // pageStart = 1;
  // pageEnd = 2;
  // pageNum = 1;
  // totalRecords = 0;
  //pageNoList: number[] = [];
  isScanSuccess: boolean = false;
  _state: any;
  _searchState: any;
  _mod: any;

  // products : ProductDto[] = [];

  productSearch: any;
  resProd: any;

  constructor(private httpService: HttpService, private route: ActivatedRoute, private stateService: StateService) { 
    this.productSearch = new ProductSearchDto();
    this.resProd = new ResponseListDto<ProductDto>()
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this._mod = params['mod'];
      if(this._mod == 'PI')
        this.headerText = 'Product Inquiry';
      else
        this.headerText = 'Products';
    })
    
    this._state = this.stateService.state$.getValue() || {};
    this._searchState = this.stateService.search$.getValue() || {};
    if(Object.keys(this._state).length == 0)
      this.loadList(1);
    else
      this.resProd = this._state;

    if(Object.keys(this._searchState).length != 0)
      this.productSearch = this._searchState;
  }

  loadList(pageNo: number){
    this.resProd.lists = [];
    this.httpService.getProducts(pageNo).subscribe(result => {
      this.resProd.pageStart = result.pageStart;
      this.resProd.pageEnd = result.pageEnd;
      this.resProd.pageNum = result.pageNum;
      this.resProd.totalRecords = result.totalRecords;
      var tempPageStart = this.resProd.pageStart;
      this.resProd.pageNoList =  Array((this.resProd.pageEnd + 1)- this.resProd.pageStart).fill(this.resProd.pageStart).map((x, i) => tempPageStart++);
      this.resProd.lists = result.lists;
      this.stateService.state$.next(this.resProd);
      this.stateService.search$.next(this.productSearch);

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
    var tempBarcode = this.productSearch.barcode.replace(/\s/g, "").trim();
    if(tempBarcode.length != 0) {
      this.getProduct(tempBarcode);
    } else {
      this.loadList(1);
    }
  }

  keyDown(){
    if(this.hasWhiteSpace(this.productSearch.barcode.trim())){
      this.productSearch.barcode = this.productSearch.barcode.replace(/\s/g, "").trim();
    }
  }

  hasWhiteSpace(str: string) {
    return /\s/g.test(str);
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
    this.productSearch.barcode = id;
    this.httpService.getProduct(this.productSearch).subscribe(result => {
      if(result.totalRecords > 0 && result.lists != null) {
        this.resProd.pageStart = result.pageStart;
        this.resProd.pageEnd = result.pageEnd;
        this.resProd.pageNum = result.pageNum;
        this.resProd.totalRecords = result.totalRecords;
        let product: Product  = new Product();
        var tempPageStart = this.resProd.pageStart;
        this.resProd.pageNoList =  Array((this.resProd.pageEnd + 1)- this.resProd.pageStart).fill(this.resProd.pageStart).map((x, i) => tempPageStart++);
        this.resProd.lists = [];
        this.resProd.lists.push(result.lists[0]);
        this.stateService.state$.next(this.resProd);
        this.stateService.search$.next(this.productSearch);
      } else {
        this.resProd.lists = [];
      }
    });
  }

  private getProductAdvSearch()
  {
    this.httpService.getProductAdvanceSearch(this.productSearch).subscribe(result => {
      this.resProd.pageStart = result.pageStart;
      this.resProd.pageEnd = result.pageEnd;
      this.resProd.pageNum = result.pageNum;
      this.resProd.totalRecords = result.totalRecords;
      var tempPageStart = this.resProd.pageStart;
      this.resProd.pageNoList =  Array((this.resProd.pageEnd + 1)- this.resProd.pageStart).fill(this.resProd.pageStart).map((x, i) => tempPageStart++);
      this.resProd.lists = result.lists;
      this.stateService.state$.next(this.resProd);
      this.stateService.search$.next(this.productSearch);
    }, error => console.error(error));
  }

  clearBarcodeStr(){
    this.productSearch.barcode = '';
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
