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
import { PaginationComponent } from '../../../components/shared/pagination/pagination.component';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PaginationComponent],
  templateUrl: './product.component.html',
  styleUrls: ['../../settings/main/main.component.css','./product.component.css']
})
export class ProductComponent implements OnInit{
  resultString: string = "";
  resultProductDescription: string = "";
  productsList: any = null;
  inputText: string = "";
  headerText: string = "";
  isScanSuccess: boolean = false;
  _state: any;
  _searchState: any;
  _mod: any;

  productSearch: any;
  resProd: any;
  allProducts: ProductDto[] = [];  // All products for client-side search
  isLoading: boolean = false;
  isSearching: boolean = false;
  hasActiveSearch: boolean = false;

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

    // Restore state and search if available
    if(Object.keys(this._state).length != 0)
      this.resProd = this._state;

    if(Object.keys(this._searchState).length != 0) {
      this.productSearch = this._searchState;
      // If there's an active search, re-execute it server-side
      if (this.productSearch.barcode && this.productSearch.barcode.trim()) {
        // Clean up the barcode based on search mode
        if (this.productSearch.searchMode === 'barcode') {
          this.productSearch.barcode = this.productSearch.barcode.replace(/[\s\r\n]+/g, '');
        } else {
          this.productSearch.barcode = this.productSearch.barcode.trim().replace(/\r\n/g, '').replace(/\r/g, '').replace(/\n/g, '');
        }
        this.searchBarcode();
      } else {
        this.loadList(1);
      }
    } else {
      this.loadList(1);
    }
  }

  /**
   * Load all products once for client-side smart search
   */
  loadAllProducts() {
    if (this.isLoading) return;

    this.isLoading = true;
    this.httpService.getProducts(1).subscribe(result => {
      const totalPages = Math.ceil(result.totalRecords / result.pageSize);
      this.allProducts = [...result.lists];

      // Load remaining pages (no limit now)
      if (totalPages > 1) {
        const promises = [];
        for (let page = 2; page <= totalPages; page++) {
          promises.push(
            this.httpService.getProducts(page).toPromise()
              .then(pageResult => {
                if (pageResult && pageResult.lists) {
                  this.allProducts = [...this.allProducts, ...pageResult.lists];
                }
              })
          );
        }

        Promise.all(promises).then(() => {
          this.isLoading = false;
          console.log(`[Product] Loaded ${this.allProducts.length} products for smart search`);
          // Display first page
          this.loadList(1);
        });
      } else {
        this.isLoading = false;
        console.log(`[Product] Loaded ${this.allProducts.length} products for smart search`);
        this.loadList(1);
      }
    }, error => {
      console.error(error);
      this.isLoading = false;
    });
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

  clickPage(pageNo: number) {
    if (this.hasActiveSearch) {
      // If there's an active search, use the search endpoint with pagination
      this.productSearch.pageNo = pageNo;
      this.httpService.getProduct(this.productSearch).subscribe(result => {
        if (result.totalRecords > 0 && result.lists) {
          this.resProd.lists = result.lists;
          this.resProd.totalRecords = result.totalRecords;
          this.resProd.pageNum = result.pageNum;
          this.resProd.pageStart = result.pageStart;
          this.resProd.pageEnd = result.pageEnd;
        } else {
          this.resProd.lists = [];
          this.resProd.totalRecords = 0;
        }
        this.stateService.state$.next(this.resProd);
      }, error => {
        console.error(error);
      });
    } else {
      // Otherwise load from regular list
      this.loadList(pageNo);
    }
  }

  clearResult(){
    this.resultString = "";
    this.resultProductDescription = "";
    this.inputText = "";
  }

  clearSearch(){
    this.productSearch.barcode = "";
    this.isScanSuccess = false;
    this.resultString = "";
    this.hasActiveSearch = false;
    this.loadList(1);
  }

  /**
   * Search on Enter key press - server-side smart search (searches entire database)
   */
  searchBarcode() {
    let searchTerm = this.productSearch.barcode ? this.productSearch.barcode : "";

    if (this.productSearch.searchMode === 'barcode') {
      // Barcode mode: remove all spaces, tabs, newlines, carriage returns (trailing and in-between)
      searchTerm = searchTerm.replace(/[\s\r\n]+/g, '');
    } else {
      // Advance mode: only trim leading/trailing spaces and newlines, keep internal spaces as delimiters
      searchTerm = searchTerm.trim().replace(/\r\n/g, '').replace(/\r/g, '').replace(/\n/g, '');
    }

    if (searchTerm.length > 0) {
      this.isSearching = true;
      this.hasActiveSearch = true;
      this.productSearch.barcode = searchTerm; // Update the model with cleaned value
      this.productSearch.pageNo = 1; // Reset to page 1 on new search

      // Send the full ProductSearchDto with searchMode to backend
      this.httpService.getProduct(this.productSearch).subscribe(result => {
        this.isSearching = false;

        if (result.totalRecords > 0 && result.lists) {
          this.resProd.lists = result.lists;
          this.resProd.totalRecords = result.totalRecords;
          this.resProd.pageNum = result.pageNum;
          this.resProd.pageStart = result.pageStart;
          this.resProd.pageEnd = result.pageEnd;
          this.isScanSuccess = true;
        } else {
          this.resProd.lists = [];
          this.resProd.totalRecords = 0;
          this.resProd.pageNum = 1;
          this.resProd.pageStart = 0;
          this.resProd.pageEnd = 0;
          this.isScanSuccess = false;
        }

        this.stateService.state$.next(this.resProd);
        this.stateService.search$.next(this.productSearch);
      }, error => {
        console.error(error);
        this.isSearching = false;
        this.hasActiveSearch = false;
      });
    } else if (searchTerm.length === 0) {
      // Empty search - reload all
      this.hasActiveSearch = false;
      this.loadList(1);
      this.isScanSuccess = false;
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
    // Remove all spaces, tabs, newlines, carriage returns from barcode
    this.productSearch.barcode = id.replace(/[\s\r\n]+/g, '');
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

  clearBarcodeStr(){
    this.productSearch.barcode = '';
    this.hasActiveSearch = false;
    this.resProd.lists = [];
    this.loadList(1);
  }

  // onCodeResult(result: string){
  //   this.resultString = result;
  //   this.httpService.getProduct(result).subscribe(res => {
  //     this.resultString = "";
  //     this.resultProductDescription = res.lists[0].cDescription;
  //   });
  // }
}
