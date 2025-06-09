import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { authGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { PharmacyAdminGuard } from './guards/pharmacy-admin.guard';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { SearchComponent } from './features/search/search.component';
import { ContactpageComponent } from './features/contactuspage/contactpage/contactpage.component';
import { CartListComponent } from './features/cart/components/cart-list/cart-list.component';
import { CaregorylistComponent } from './features/category/caregorylist/caregorylist.component';
import { DrugsComponent } from './features/categorypage/drugs/drugs.component';
import { MedicalSuppliesComponent } from './features/categorypage/medical-supplies/medical-supplies.component';
import { FitnessNutritionComponent } from './features/categorypage/fitness-nutrition/fitness-nutrition.component';
import { OrganicHerbalComponent } from './features/categorypage/organic-herbal/organic-herbal.component';
import { HomeCareComponent } from './features/categorypage/home-care/home-care.component';
import { ProductDetailsComponent } from './features/product-details/product-details.component';
import { ConvertAiComponent } from './features/ai/convert-ai/convert-ai.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { ProfileComponent } from './profile/profile.component';
import { BlankLayoutComponent } from './layouts/blank-layout/blank-layout.component';
import { NotfoundComponent } from './components/notfound/notfound.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { AdminDashboardComponent } from './features/admin/admin-dashboard/admin-dashboard.component';
import { UsersComponent } from './features/admin/users/users.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/home',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'forgot-password', component: ForgotPasswordComponent },
      {
        path: '',
        component: AuthLayoutComponent,
        canActivate: [authGuard],
        children: [
          { path: 'home', component: HomeComponent },
          { path: 'search', component: SearchComponent },
          { path: 'contact', component: ContactpageComponent },
          { path: 'cart', component: CartListComponent },
          {
            path: 'category',
            children: [
              { path: '', component: CaregorylistComponent },
              { path: 'drugs', component: DrugsComponent },
              { path: 'medical-supplies', component: MedicalSuppliesComponent },
              { path: 'fitness-nutrition', component: FitnessNutritionComponent },
              { path: 'organic-herbal', component: OrganicHerbalComponent },
              { path: 'home-care', component: HomeCareComponent }
            ]
          },
          { path: 'product-details', component: ProductDetailsComponent },
          { path: 'convert', component: ConvertAiComponent },
          { path: 'checkout', component: CheckoutComponent },
          { path: 'profile', component: ProfileComponent }
        ]
      }
    ]
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [authGuard, AdminGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
      { path: 'products', loadComponent: () => import('./features/admin/products/products.component').then(m => m.ProductsComponent) },
      { path: 'pharmacies', loadComponent: () => import('./features/admin/pharmacies/pharmacies.component').then(m => m.PharmaciesComponent) },
      { path: 'users', loadComponent: () => import('./features/admin/users/users.component').then(m => m.UsersComponent) },
      { path: 'reports', loadComponent: () => import('./features/admin/reports/reports.component').then(m => m.ReportsComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  {
    path: 'pharmacy-admin',
    loadComponent: () => import('./features/pharmacy-admin/pharmacy-admin.component').then(m => m.PharmacyAdminComponent),
    canActivate: [authGuard, PharmacyAdminGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/pharmacy-admin/dashboard/dashboard.component').then(m => m.PharmacyDashboardComponent) },
      { path: 'products', loadComponent: () => import('./features/pharmacy-admin/products/products.component').then(m => m.ProductsComponent) },
      { path: 'orders', loadComponent: () => import('./features/pharmacy-admin/orders/orders.component').then(m => m.OrdersComponent) },
      { path: 'reports', loadComponent: () => import('./features/pharmacy-admin/reports/reports.component').then(m => m.ReportsComponent) },
      { path: 'profile', loadComponent: () => import('./features/pharmacy-admin/profile/profile.component').then(m => m.PharmacyProfileComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: 'blank', component: BlankLayoutComponent, children: [] },
  { path: '**', component: NotfoundComponent }
];
