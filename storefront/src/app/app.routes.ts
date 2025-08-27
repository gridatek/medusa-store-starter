import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home.component';
import { ProductDetailComponent } from './pages/product-detail.component';
import { CartComponent } from './pages/cart.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'products/:id', component: ProductDetailComponent },
  { path: 'cart', component: CartComponent },
  {
    path: 'products',
    loadComponent: () => import('./pages/products.component').then((m) => m.ProductsComponent),
  },
  {
    path: 'checkout',
    loadComponent: () => import('./pages/checkout.component').then((m) => m.CheckoutComponent),
  },
  { path: '**', redirectTo: '' },
];
