import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ProductSearchService, Product } from '../../services/product-search.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-search',
  imports: [CommonModule, RouterModule],
  template: `
    <div class="relative w-full max-w-md">
      <!-- Search Input -->
      <div class="relative">
        <input
          #searchInput
          type="text"
          data-testid="product-search-input"
          placeholder="Search products..."
          class="w-full px-4 py-3 pl-12 pr-4 text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          (input)="onSearchInput($event)"
          (focus)="onInputFocus()"
          (blur)="onInputBlur()"
        />
        <div class="absolute inset-y-0 left-0 flex items-center pl-4">
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </div>
        <div *ngIf="isLoading" class="absolute inset-y-0 right-0 flex items-center pr-4">
          <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
        </div>
      </div>

      <!-- Search Results Dropdown -->
      <div
        *ngIf="showResults && (searchResults.length > 0 || showNoResults)"
        data-testid="search-results"
        class="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto"
      >
        <!-- Results -->
        <div *ngIf="searchResults.length > 0" class="py-2">
          <div
            *ngFor="let product of searchResults; trackBy: trackByProductId"
            data-testid="product-card"
            class="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            (click)="onProductClick(product)"
          >
            <div class="flex items-center space-x-3">
              <img
                [src]="product.thumbnail || '/assets/placeholder-product.png'"
                [alt]="product.title"
                data-testid="product-image"
                class="w-12 h-12 object-cover rounded-md flex-shrink-0"
              />
              <div class="flex-1 min-w-0">
                <h3 data-testid="product-title" class="text-sm font-medium text-gray-900 truncate">
                  {{ product.title }}
                </h3>
                <p class="text-sm text-gray-500 truncate">
                  {{ product.description }}
                </p>
                <p data-testid="product-price" class="text-sm font-semibold text-blue-600">
                  {{ formatPrice(product) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- No Results -->
        <div
          *ngIf="searchResults.length === 0 && showNoResults"
          data-testid="no-results-message"
          class="px-4 py-8 text-center"
        >
          <div class="text-gray-400 mb-2">
            <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
          <p class="text-sm text-gray-500">No products found</p>
          <p class="text-xs text-gray-400 mt-1">Try adjusting your search terms</p>
        </div>
      </div>

      <!-- Overlay to close dropdown when clicking outside -->
      <div *ngIf="showResults" class="fixed inset-0 z-40" (click)="closeResults()"></div>
    </div>
  `,
  styles: [],
})
export class ProductSearchComponent implements OnInit, OnDestroy {
  searchResults: Product[] = [];
  isLoading = false;
  showResults = false;
  showNoResults = false;

  private searchSubject = new Subject<string>();
  private subscriptions = new Subscription();

  constructor(
    private productSearchService: ProductSearchService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // Setup search debouncing
    this.subscriptions.add(
      this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe((query) => {
        this.performSearch(query);
      }),
    );

    // Subscribe to search results
    this.subscriptions.add(
      this.productSearchService.getSearchResults().subscribe((results) => {
        this.searchResults = results;
        this.showNoResults = results.length === 0;
      }),
    );

    // Subscribe to loading state
    this.subscriptions.add(
      this.productSearchService.isLoading().subscribe((loading) => {
        this.isLoading = loading;
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const query = target.value.trim();

    if (query) {
      this.showResults = true;
      this.searchSubject.next(query);
    } else {
      this.clearSearch();
    }
  }

  onInputFocus(): void {
    if (this.searchResults.length > 0) {
      this.showResults = true;
    }
  }

  onInputBlur(): void {
    // Delay hiding results to allow for clicks
    setTimeout(() => {
      this.showResults = false;
    }, 200);
  }

  onProductClick(product: Product): void {
    this.router.navigate(['/products', product.id]);
    this.closeResults();
  }

  closeResults(): void {
    this.showResults = false;
  }

  clearSearch(): void {
    this.productSearchService.clearResults();
    this.showResults = false;
    this.showNoResults = false;
  }

  trackByProductId(index: number, product: Product): string {
    return product.id;
  }

  formatPrice(product: Product): string {
    const variant = product.variants?.[0];
    const price = variant?.prices?.[0];

    if (price) {
      const amount = price.amount / 100; // Convert from cents
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: price.currency_code.toUpperCase(),
      }).format(amount);
    }

    return 'Price not available';
  }

  private performSearch(query: string): void {
    this.productSearchService.searchProducts(query).subscribe();
  }
}
