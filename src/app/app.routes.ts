import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/settings/login/login.component';
import { LogoutComponent } from './components/settings/logout/logout.component';
import { ProductComponent } from './components/inventory/product/product.component';
import { ProductDetailComponent } from './components/inventory/product-detail/product-detail.component';
import { ProductInquiryComponent } from './components/inventory/product-inquiry/product-inquiry.component';
import { ProductStockTakeComponent } from './components/inventory/product-stock-take/product-stock-take.component';
import { ProductStockTakeDetailComponent } from './components/inventory/product-stock-take-detail/product-stock-take-detail.component';
import { InventoryStockTakeComponent } from './components/inventory/inventory-stock-take/inventory-stock-take.component';
import { InventoryStockTakeDetailComponent } from './components/inventory/inventory-stock-take-detail/inventory-stock-take-detail.component';
import { UserComponent } from './components/settings/user/user.component';
import { UserDetailComponent } from './components/settings/userdetail/userdetail.component';
import { PrintPageComponent } from './components/settings/print-page/print-page.component';
import { BirPostingSlspComponent } from './components/inventory/bir-posting-slsp/bir-posting-slsp.component';
import { AuthGuard } from './guards/auth.guard';
import { OtherAdjustmentComponent } from './components/inventory/other-adjustment/other-adjustment.component';
import { DetailComponent } from './components/shared/detail/detail.component';
import { AppconfigComponent } from './components/settings/appconfig/appconfig.component';
import { AppconfigDetailComponent } from './components/settings/appconfig-detail/appconfig-detail.component';
import { CustomerComponent } from './components/settings/customer/customer.component';
import { CustomerDetailComponent } from './components/settings/customer-detail/customer-detail.component';
import { SupplierComponent } from './components/settings/supplier/supplier.component';
import { SupplierDetailComponent } from './components/settings/supplier-detail/supplier-detail.component';
import { PayeeComponent } from './components/settings/payee/payee.component';
import { PayeeDetailComponent } from './components/settings/payee-detail/payee-detail.component';

export const routes: Routes = [
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
    { path: 'login', component: LoginComponent},
    { path: 'logout', component: LogoutComponent, canActivate: [AuthGuard] },
    { path: 'product/:mod', component: ProductComponent, canActivate: [AuthGuard] },
    { path: 'productdetails/:id', component: ProductDetailComponent, canActivate: [AuthGuard] },
    { path: 'productinquiry/:id', component: ProductInquiryComponent, canActivate: [AuthGuard] },
    { path: 'productstocktake', component: ProductStockTakeComponent, canActivate: [AuthGuard] },
    { path: 'productstocktakedetails/:id', component: ProductStockTakeDetailComponent, canActivate: [AuthGuard] },
    { path: 'inventorystocktake', component: InventoryStockTakeComponent, canActivate: [AuthGuard] },
    { path: 'inventorystocktakedetails/:id', component: InventoryStockTakeDetailComponent, canActivate: [AuthGuard] },
    { path: 'inventory/otheradj', component: OtherAdjustmentComponent, canActivate: [AuthGuard] },
    { path: 'inventory/otheradj/new', component: DetailComponent, canActivate: [AuthGuard], data: { moduleType: 'OTHERADJ' } },
    { path: 'inventory/otheradj/:id', component: DetailComponent, canActivate: [AuthGuard], data: { moduleType: 'OTHERADJ' } },
    { path: 'transaction/:moduleType/new', component: DetailComponent, canActivate: [AuthGuard] },
    { path: 'transaction/:moduleType/:id', component: DetailComponent, canActivate: [AuthGuard] },
    { path: 'user', component: UserComponent, canActivate: [AuthGuard] },
    { path: 'userdetails/:id', component: UserDetailComponent, canActivate: [AuthGuard] },
    { path: 'printpage', component: PrintPageComponent, canActivate: [AuthGuard] },
    { path: 'bir-posting-slsp', component: BirPostingSlspComponent, canActivate: [AuthGuard] },
    { path: 'settings/appconfig', component: AppconfigComponent, canActivate: [AuthGuard] },
    { path: 'settings/appconfig/new', component: AppconfigDetailComponent, canActivate: [AuthGuard] },
    { path: 'settings/appconfig/:id', component: AppconfigDetailComponent, canActivate: [AuthGuard] },
    { path: 'settings/customer', component: CustomerComponent, canActivate: [AuthGuard] },
    { path: 'settings/customer/new', component: CustomerDetailComponent, canActivate: [AuthGuard] },
    { path: 'settings/customer/:id', component: CustomerDetailComponent, canActivate: [AuthGuard] },
    { path: 'settings/supplier', component: SupplierComponent, canActivate: [AuthGuard] },
    { path: 'settings/supplier/new', component: SupplierDetailComponent, canActivate: [AuthGuard] },
    { path: 'settings/supplier/:id', component: SupplierDetailComponent, canActivate: [AuthGuard] },
    { path: 'settings/payee', component: PayeeComponent, canActivate: [AuthGuard] },
    { path: 'settings/payee/new', component: PayeeDetailComponent, canActivate: [AuthGuard] },
    { path: 'settings/payee/:id', component: PayeeDetailComponent, canActivate: [AuthGuard] },
    // Else - redirect to login for any unknown routes
    { path: '**', component: LoginComponent}
];
