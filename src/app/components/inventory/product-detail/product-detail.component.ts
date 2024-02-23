import { Component, EventEmitter, OnInit } from '@angular/core';
import { ProductDto } from '../../../models/dto/productDto';
import { HttpService } from '../../../services/http.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AlertService } from '../../../services/alert.service';
import { ProductBarcodeDto } from '../../../models/dto/productBarcodeDto';
import { ActionMenuComponent } from "../../settings/action-menu/action-menu.component";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QRCodeModule } from 'angularx-qrcode';

@Component({
    selector: 'app-product-detail',
    standalone: true,
    templateUrl: './product-detail.component.html',
    styleUrls: ['../../settings/main/main.component.css','./product-detail.component.css'],
    imports: [CommonModule, FormsModule, RouterModule, ActionMenuComponent, QRCodeModule]
})
export class ProductDetailComponent implements OnInit{
  vendorBarcode: string = "";
  myQrCode: string = "";
  product: ProductDto = new ProductDto;
  // allowedFormats = [ BarcodeFormat.QR_CODE, BarcodeFormat.CODE_128, BarcodeFormat.EAN_13];

  toggleSave = new EventEmitter<boolean>(); 

  constructor(private httpService: HttpService, private route: ActivatedRoute, private alertService:AlertService) { 
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')?.toString();
    this.httpService.getProduct(this.route.snapshot.paramMap.get('id')??"").subscribe(result => {
      if(result!=null && result.lists.length > 0) {
        this.product = result.lists[0];
        this.myQrCode = this.product.id != null ? this.product.id.toString() : '';
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

  onCodeResult(result: string){
    //this.product.bar = result;
    document.getElementById("modalClose")?.click();
  }

  addSupplierBarcode(){
    // mapper
    // Product
    if(this.vendorBarcode.trim().length > 0) {
      this.httpService.isBarcodeExist(this.vendorBarcode).subscribe(res=>{
        if(res.success) {
          let prodBarcodeDto: ProductBarcodeDto = new ProductBarcodeDto();
          prodBarcodeDto.barcode = this.vendorBarcode.trim();
          prodBarcodeDto.isActive = true; // Change this to checkbox
          this.product.barcodes.push(prodBarcodeDto);

          this.onModelChanged();
        } else {
          this.alertService.setCustomErrorAlert(res.data);
        }
      });
    }
  }

  onModelChanged(){
    this.toggleSave.emit(true);
  }

  onSave(){
    this.product.sessionGuid = localStorage.getItem('sessionToken')??"";
    this.httpService.patchProduct(this.product).subscribe((res) => {
      this.alertService.setSuccessAlert();
      this.vendorBarcode = "";
    }, (err) => {
      this.alertService.setErrorAlert();
    });
  }
}
