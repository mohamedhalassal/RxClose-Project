import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PharmacyAdminComponent } from './pharmacy-admin.component';
import { PharmacyDashboardComponent } from './dashboard/dashboard.component';
import { ProductsComponent } from './products/products.component';
import { OrdersComponent } from './orders/orders.component';
import { PharmacyProfileComponent } from './profile/profile.component';
import { ReportsComponent } from './reports/reports.component';
import { PharmacyRegisterComponent } from './pharmacy-register/pharmacy-register.component';
import { ProfileCompletionGuard } from '../../guards/profile-completion.guard';

const routes: Routes = [
  {
    path: '',
    component: PharmacyAdminComponent,
    children: [
      { 
        path: '', 
        canActivate: [ProfileCompletionGuard],
        children: [
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
          { path: 'dashboard', component: PharmacyDashboardComponent },
          { path: 'products', component: ProductsComponent },
          { path: 'orders', component: OrdersComponent },
          { path: 'reports', component: ReportsComponent },
          { path: 'register', component: PharmacyRegisterComponent }
        ]
      },
      { path: 'profile', component: PharmacyProfileComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PharmacyAdminRoutingModule { } 