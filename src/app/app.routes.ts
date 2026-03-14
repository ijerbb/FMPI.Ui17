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
import { AuthGuard } from './guards/auth.guard';

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
    { path: 'user', component: UserComponent, canActivate: [AuthGuard] },
    { path: 'userdetails/:id', component: UserDetailComponent, canActivate: [AuthGuard] },
    { path: 'printpage', component: PrintPageComponent, canActivate: [AuthGuard] },
    // Else - redirect to login for any unknown routes
    { path: '**', component: LoginComponent}
];
