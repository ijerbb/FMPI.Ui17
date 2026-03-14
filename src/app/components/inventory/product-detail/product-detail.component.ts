import { Component, EventEmitter, OnInit, Sanitizer, ViewChild } from '@angular/core';
import { ProductDto } from '../../../models/dto/productDto';
import { HttpService } from '../../../services/http.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AlertService } from '../../../services/alert.service';
import { CryptoService } from '../../../services/crypto.service';
import { ProductBarcodeDto } from '../../../models/dto/productBarcodeDto';
import { ActionMenuComponent } from "../../settings/action-menu/action-menu.component";
import { CommonModule, formatNumber } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QRCodeModule } from 'angularx-qrcode';
import { DomSanitizer, SafeHtml, SafeResourceUrl, SafeUrl} from '@angular/platform-browser';

import pdfMake from "pdfmake/build/pdfmake";  
import * as pdfFonts from "pdfmake/build/vfs_fonts";  
import { SafePipe } from 'safe-pipe';
import { ProductSearchDto } from '../../../models/dto/productSearchDto';

import * as CryptoJS from 'crypto-js'; // Move to Security Helper


@Component({
    selector: 'app-product-detail',
    standalone: true,
    templateUrl: './product-detail.component.html',
    styleUrls: ['../../settings/main/main.component.css','./product-detail.component.css'],
    imports: [CommonModule, FormsModule, RouterModule, ActionMenuComponent, QRCodeModule, SafePipe]
})
export class ProductDetailComponent implements OnInit{
  _secretKey = 'FMPISecretKey123'; // must match backend key
  barcodeToExclusionList: boolean = false;
  _isAuthorizedUser:boolean = false;
  _authorizedUserPassword:string = "";
  printQuantity: number = 1;
  vendorBarcode: string = "";
  myQrCode: string = "";
  price: string = "";
  errorMessage: string = "";
  exclusionListSafeHtml: SafeHtml | undefined;
  product: ProductDto = new ProductDto;  

  qrSizes: any[] = [
    { id: 1, name: 'Small' },
    { id: 2, name: 'Medium' },
    { id: 3, name: 'Large' },
  ];
  qrSelectedSize = 1;
  qrSetting: any = {
    qrPerRow: 0,
    qrSize: 0,
    qrText: 0
  }

  qrPDF: any;
  // allowedFormats = [ BarcodeFormat.QR_CODE, BarcodeFormat.CODE_128, BarcodeFormat.EAN_13];

  toggleSave = new EventEmitter<boolean>();
  togglePrint = new EventEmitter<boolean>(); 


  constructor(private httpService: HttpService, 
    private route: ActivatedRoute, 
    private alertService:AlertService, 
    private sanitizer: DomSanitizer,
    private cryptoService: CryptoService) { 
  }

  ngOnInit(): void {
    var id = this.route.snapshot.paramMap.get('id')??"";
    var productSearch = new ProductSearchDto();
    productSearch.barcode = id;
    this.httpService.getProduct(productSearch).subscribe(result => {
      if(result!=null && result.lists.length > 0) {
        this.product = result.lists[0];
        this.myQrCode = this.product.id != null ? this.product.id.toString() : '';
        this.price = formatNumber(this.product.price,"en-IN", "1.2-2");
        this.product.logs.forEach(element => {
          switch(element.action){
            case "UPD": {
              element.actionDescription = "Updated"
              break;
            }
          }
        });

        this.togglePrint.emit(true);
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
    var tempBarcode = this.vendorBarcode.replace(/\s/g, "").trim();
    this.vendorBarcode = tempBarcode;
    if(tempBarcode.length > 0) {
      if(!tempBarcode.includes('http') && !tempBarcode.includes('www')){
        this.httpService.isBarcodeExist(tempBarcode).subscribe(res=>{
          if(res.success) {
            let prodBarcodeDto: ProductBarcodeDto = new ProductBarcodeDto();
            prodBarcodeDto.barcode = tempBarcode;
            prodBarcodeDto.isActive = true; // Change this to checkbox
            this.product.barcodes.push(prodBarcodeDto);
  
            this.onModelChanged();
          } else {
            var resData = res.data.toUpperCase();
            if(resData.indexOf('EXIST') > 0) {
              var sessionToken = localStorage.getItem('sessionToken');
              this.httpService.verifyAccessRights(sessionToken??"","IsUserAdmin").subscribe(resp=>{
                this._isAuthorizedUser = resp.success;
                this.barcodeToExclusionList = true;
                this.createExclusionListWarningMessage(res);
              });
            } else if(resData.indexOf('EXCLUSION') > 0) {
              this.barcodeToExclusionList = false;
              this.createExclusionListWarningMessage(res);
            } else {
              this.alertService.setCustomErrorAlert(res.data);
            }
          }
        });
      }
    }
  }
  
  createExclusionListWarningMessage(response:any){

    this.errorMessage = response.data;
    var rawData = JSON.parse(response.rawData);
    const exclusionProducts: ProductDto[] = rawData.map((prod: any) => ({
      code: prod.Code
    }));

    const htmlList = `
      <ul>
        ${exclusionProducts.map(u => `<li>${u.code}</li>`).join("")}
      </ul>
      `;
    this.exclusionListSafeHtml = this.sanitizer.bypassSecurityTrustHtml(htmlList);


    document.getElementById("btnConfirm")?.click();
  }

  addBarcodeToExclusionList(){
    var tempBarcode = this.vendorBarcode.replace(/\s/g, "").trim();
    var productBarcodeDto = new ProductBarcodeDto();
    productBarcodeDto.barcode = tempBarcode;
    this.httpService.excludeBarcode(productBarcodeDto).subscribe((res) => {
      if(res) {
        this.alertService.setSuccessAlert();
      }
    });
  }

  exclusionAccessOverride(){
    this.httpService.verifyOverride(this.encryptData(this._authorizedUserPassword)).subscribe((res) => {
      if(res) {
        this._isAuthorizedUser = res.success;
        if(!this._isAuthorizedUser) {
          this.alertService.setCustomErrorAlert("Invalid password!")
        }
      }
    });
  }

  encryptData(data: string): string {
    return this.cryptoService.encryptToBase64(data);
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


  onPrint(){
    document.getElementById("btnQtyConfirm")?.click();
  }

  printQR(){
    if(this.printQuantity <= 0)
      return;

    let qrItemIdList: string[] = [];
    let selectedFormat: any;
    
    for (let qty = 0; qty < this.printQuantity; qty++) {
      qrItemIdList.push(this.product.id?.toString() ?? '');
    }
    
    let docDefinition = {
      pageMargins: 30,
      content: []
    }

    // qrMap.forEach((key, value) => {
    //   if(value == this.qrSelectedSize-1)
    //     selectedFormat = key;
    // });
    switch(this.qrSelectedSize.toString())
    {
      case '1':  
        this.qrSetting.qrPerRow = 6;
        this.qrSetting.qrSize = 70;
        this.qrSetting.qrText = 7;
        break;
      case '2':  
        this.qrSetting.qrPerRow = 4;
        this.qrSetting.qrSize = 90;
        this.qrSetting.qrText = 10;
        break;
      case '3':  
        this.qrSetting.qrPerRow = 3;
        this.qrSetting.qrSize = 110;
        this.qrSetting.qrText = 12;
      break;
    }

    this.qrContent(docDefinition.content, qrItemIdList, this.qrSetting);
    
   
    //pdfMake.vfs = pdfFonts.pdfMake.vfs;
    (pdfMake as any).vfs = (pdfFonts as any).vfs;
    pdfMake.createPdf(docDefinition).getBlob(res=>{
      const url = URL.createObjectURL(res);
      this.qrPDF = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    });
    // pdfMake.createPdf(docDefinition).getBase64(res => {
    //   console.log(res);

      
    // });

    // pdfMake.createPdf(docDefinition).getDataUrl(x=>{
    //   document.getElementById('qrPDF')?.ur  = x;
    //   // document.getElementById('qrPDF').src = outDoc;
    // });
  }

  

  qrContent(content: any, arr: string[], qrSett: any){
      let counter: number = 0;
      let a: string[] = [];
      for (let index = 0; index < arr.length; index++) {
        a.push(arr[index]);
        if(counter == qrSett.qrPerRow){
          content.push(this.qrColumns(a, qrSett));
          content.push(this.header());
          a = [];
          counter = 0;
        } else {
          counter++;
        }
        if(index+1 == arr.length)
        content.push(this.qrColumns(a, qrSett));
      } 
    }

    qrColumns(arr: string[], qrSett: any){
      let col = {
        columns: arr.map(function(item){
          return [{ qr: item, fit: qrSett.qrSize, alignment: 'left' }, { text: item, fontSize: qrSett.qrText, margins: [0,0,0,50] }]
        })
      }
      return col;
    }

    header() {
      return { text: '\n' };
    }
}
