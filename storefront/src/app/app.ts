import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProductSearchComponent } from './components/product-search/product-search.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ProductSearchComponent],
  template: `
    <h1>Welcome to {{ title() }}!</h1>

    <!-- In your header template -->
    <div class="flex items-center justify-between px-4 py-3">
      <div class="flex items-center space-x-4">
        <h1 class="text-xl font-bold">Your Store</h1>
      </div>

      <!-- Search Component -->
      <div class="flex-1 max-w-lg mx-8">
        <app-product-search></app-product-search>
      </div>

      <div class="flex items-center space-x-4">
        <!-- Other header items -->
      </div>
    </div>

    <router-outlet />
  `,
  styles: [],
})
export class App {
  protected readonly title = signal('storefront');
}
