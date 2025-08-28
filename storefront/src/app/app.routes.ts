import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home.component').then((m) => m.HomeComponent) },
  {
    path: 'products/:id',
    loadComponent: () =>
      import('./pages/product-detail.component').then((m) => m.ProductDetailComponent),
  },
  {
    path: 'cart',
    loadComponent: () => import('./pages/cart.component').then((m) => m.CartComponent),
  },
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
