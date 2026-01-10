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

export const routes: Routes = [
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'login', component: LoginComponent},
    { path: 'logout', component: LogoutComponent},
    { path: 'product/:mod', component: ProductComponent },
    { path: 'productdetails/:id', component: ProductDetailComponent },
    { path: 'productinquiry/:id', component: ProductInquiryComponent },
    { path: 'productstocktake', component: ProductStockTakeComponent },
    { path: 'productstocktakedetails/:id', component: ProductStockTakeDetailComponent },
    { path: 'inventorystocktake', component: InventoryStockTakeComponent },
    { path: 'inventorystocktakedetails/:id', component: InventoryStockTakeDetailComponent },
    { path: 'user', component: UserComponent},
    { path: 'userdetails/:id', component: UserDetailComponent},
    { path: 'printpage', component: PrintPageComponent},
    // Else
    { path: '**', redirectTo: '/dashboard'}
];
