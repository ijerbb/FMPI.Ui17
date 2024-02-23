import { Component, EventEmitter, OnInit } from '@angular/core';
import { ProductDto } from '../../../models/dto/productDto';
import { ProductStockTakeDto } from '../../../models/dto/productStockTakeDto';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpService } from '../../../services/http.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AlertService } from '../../../services/alert.service';
import { FormsModule } from '@angular/forms';
import { ActionMenuComponent } from "../../settings/action-menu/action-menu.component";

@Component({
    selector: 'app-product-stock-take-detail',
    standalone: true,
    templateUrl: './product-stock-take-detail.component.html',
    styleUrls: ['../../settings/main/main.component.css', './product-stock-take-detail.component.css'],
    imports: [CommonModule, FormsModule, RouterModule, ActionMenuComponent]
})
export class ProductStockTakeDetailComponent implements OnInit {
  quantityActual: number =  0;
  product: ProductDto = new ProductDto;
  productStockTake: ProductStockTakeDto = new ProductStockTakeDto;
  datePipe = new DatePipe('en-US'); // Use your own locale
  dateStockTake: any;

  toggleSave = new EventEmitter<boolean>(); 
  
  constructor(private httpService: HttpService, private route: ActivatedRoute, private alertService:AlertService) { }

  ngOnInit(): void {
    this.dateStockTake = this.datePipe.transform(new Date(), 'MM/dd/yyyy');
    const id = this.route.snapshot.paramMap.get('id')?.toString();
    this.httpService.getProduct(this.route.snapshot.paramMap.get('id')??"").subscribe(result => {
      if(result!=null && result.lists.length > 0) {
        this.product = result.lists[0];
        this.product.stockTakes.forEach(element => {
          element.transDate = this.datePipe.transform(element.transDate,'MM/dd/yyyy')!.toString();
        });
        this.product.logs.forEach(element => {
          switch(element.action){
            case "UPD": {
              element.actionDescription = "Updated"
              break;
            }
          }
        });
      }
    });
  }

  recordStockTake(){
    let stockTakeExist: boolean = false;
    this.product.stockTakes.forEach(element => {
      if(new Date(element.transDate??new Date()).getMonth()==new Date(this.dateStockTake).getMonth()) {
        stockTakeExist = true;
        console.log(new Date(this.dateStockTake).getMonth());
      }
    });

    if(stockTakeExist) {
      this.alertService.setCustomErrorAlert("Stock-Take already exist for the same month");
    } else {
      this.productStockTake.sysFK_Invty = this.product.id;
      this.productStockTake.qtyOnHand = this.product.qtyOnHand;
      this.productStockTake.actualQty = this.quantityActual;
      

      this.productStockTake.transDate = this.dateStockTake;
      this.product.stockTakes.splice(0,0,this.productStockTake);

      this.toggleSave.emit(true);
    }
  }

  onSave(){
    let transDate = this.productStockTake.transDate;
    this.productStockTake.transDate = new Date(this.productStockTake.transDate).toISOString();
    this.httpService.recordStockTake(this.productStockTake).subscribe(result => {
      if(result != null && result) {
        this.productStockTake.transDate = transDate;
        this.alertService.setSuccessAlert();
      } else {
        this.alertService.setErrorAlert();
      }
    }, (err) => {
      this.alertService.setErrorAlert();
    })
  }
}
