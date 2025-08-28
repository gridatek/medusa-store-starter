// storefront/src/app/pages/products.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';

import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription, combineLatest } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MedusaApiService } from '../services/medusa-api.service';
import { CartService } from '../services/cart.service';
import {
  Product,
  ProductCollection,
  ProductType,
  ProductTag,
  formatPrice,
  getProductPrice,
  isProductInStock,
  ITEMS_PER_PAGE,
} from '../../../../shared/src/types';

interface FilterState {
  search?: string;
  collection_id?: string[];
  type_id?: string[];
  tags?: string[];
  price_min?: number;
  price_max?: number;
  sort?: string;
  page?: number;
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [RouterModule, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Products</h1>
        <p class="text-gray-600">Discover our complete collection of products</p>
      </div>

      <div class="lg:grid lg:grid-cols-4 lg:gap-x-8">
        <!-- Filters Sidebar -->
        <div class="lg:col-span-1 mb-8 lg:mb-0">
          <div class="bg-white rounded-lg shadow p-6 sticky top-24">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Filters</h2>

            <!-- Search Filter -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search products..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                [(ngModel)]="searchQuery"
                (input)="onSearchChange()"
              />
            </div>

            <!-- Collection Filter -->
            @if (collections.length > 0) {
              <div class="mb-6">
                <h3 class="text-sm font-medium text-gray-700 mb-3">Collections</h3>
                <div class="space-y-2 max-h-40 overflow-y-auto">
                  @for (collection of collections; track collection) {
                    <div class="flex items-center">
                      <input
                        type="checkbox"
                        [id]="'collection-' + collection.id"
                        [value]="collection.id"
                        [checked]="selectedCollections.includes(collection.id)"
                        (change)="onCollectionChange(collection.id, $event)"
                        class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                      <label
                        [for]="'collection-' + collection.id"
                        class="ml-2 text-sm text-gray-700 cursor-pointer"
                      >
                        {{ collection.title }}
                      </label>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Product Type Filter -->
            @if (productTypes.length > 0) {
              <div class="mb-6">
                <h3 class="text-sm font-medium text-gray-700 mb-3">Product Types</h3>
                <div class="space-y-2 max-h-40 overflow-y-auto">
                  @for (type of productTypes; track type) {
                    <div class="flex items-center">
                      <input
                        type="checkbox"
                        [id]="'type-' + type.id"
                        [value]="type.id"
                        [checked]="selectedTypes.includes(type.id)"
                        (change)="onTypeChange(type.id, $event)"
                        class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                      <label
                        [for]="'type-' + type.id"
                        class="ml-2 text-sm text-gray-700 cursor-pointer"
                      >
                        {{ type.value }}
                      </label>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Price Range Filter -->
            <div class="mb-6">
              <h3 class="text-sm font-medium text-gray-700 mb-3">Price Range</h3>
              <div class="space-y-3">
                <div>
                  <label class="block text-xs text-gray-500 mb-1">Min Price</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    [(ngModel)]="priceRange.min"
                    (input)="onPriceRangeChange()"
                  />
                </div>
                <div>
                  <label class="block text-xs text-gray-500 mb-1">Max Price</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="1000"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    [(ngModel)]="priceRange.max"
                    (input)="onPriceRangeChange()"
                  />
                </div>
              </div>
            </div>

            <!-- Tags Filter -->
            @if (tags.length > 0) {
              <div class="mb-6">
                <h3 class="text-sm font-medium text-gray-700 mb-3">Tags</h3>
                <div class="flex flex-wrap gap-2">
                  @for (tag of tags; track tag) {
                    <button
                      class="px-2 py-1 text-xs border border-gray-300 rounded-full hover:border-blue-300 transition-colors"
                      [class.bg-blue-100]="selectedTags.includes(tag.id)"
                      [class.border-blue-500]="selectedTags.includes(tag.id)"
                      [class.text-blue-700]="selectedTags.includes(tag.id)"
                      (click)="toggleTag(tag.id)"
                    >
                      {{ tag.value }}
                    </button>
                  }
                </div>
              </div>
            }

            <!-- Clear Filters -->
            <button
              class="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
              (click)="clearAllFilters()"
            >
              Clear All Filters
            </button>
          </div>
        </div>

        <!-- Products Grid -->
        <div class="lg:col-span-3">
          <!-- Results Header -->
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center space-x-4">
              <p class="text-sm text-gray-500">
                {{ totalProducts }} product{{ totalProducts !== 1 ? 's' : '' }} found
              </p>
            </div>

            <!-- Sort Dropdown -->
            <div class="flex items-center space-x-4">
              <label class="text-sm text-gray-700">Sort by:</label>
              <select
                class="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                [(ngModel)]="sortBy"
                (change)="onSortChange()"
              >
                <option value="">Default</option>
                <option value="title">Name (A-Z)</option>
                <option value="-title">Name (Z-A)</option>
                <option value="created_at">Newest First</option>
                <option value="-created_at">Oldest First</option>
              </select>
            </div>
          </div>

          <!-- Loading State -->
          @if (isLoading) {
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              @for (item of [1, 2, 3, 4, 5, 6]; track item) {
                <div class="bg-gray-200 rounded-lg h-80 animate-pulse"></div>
              }
            </div>
          }

          <!-- Error State -->
          @if (hasError && !isLoading) {
            <div data-testid="error-message" class="text-center py-16">
              <div class="text-red-500 mb-4">
                <svg
                  class="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  ></path>
                </svg>
              </div>
              <p class="text-lg text-gray-600 mb-4">Failed to load products</p>
              <button
                class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                (click)="loadProducts()"
              >
                Try Again
              </button>
            </div>
          }

          <!-- Empty State -->
          @if (!isLoading && !hasError && products.length === 0) {
            <div class="text-center py-16">
              <div class="text-gray-400 mb-4">
                <svg
                  class="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  ></path>
                </svg>
              </div>
              <p class="text-lg text-gray-600 mb-2">No products found</p>
              <p class="text-gray-500">Try adjusting your filters or search terms</p>
            </div>
          }

          <!-- Products Grid -->
          @if (!isLoading && !hasError && products.length > 0) {
            <div
              data-testid="product-grid"
              class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              @for (product of products; track trackByProductId($index, product)) {
                <div
                  data-testid="product-card"
                  class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer group"
                  (click)="navigateToProduct(product)"
                >
                  <div
                    class="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-lg bg-gray-200"
                  >
                    <img
                      data-testid="product-image"
                      [src]="getProductImage(product)"
                      [alt]="product.title"
                      class="w-full h-48 object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      (error)="onImageError($event)"
                    />
                  </div>
                  <div class="p-4">
                    <h3
                      data-testid="product-title"
                      class="text-lg font-medium text-gray-900 mb-2 line-clamp-2"
                    >
                      {{ product.title }}
                    </h3>
                    <p class="text-sm text-gray-600 mb-3 line-clamp-2">
                      {{ product.description }}
                    </p>
                    <div class="flex items-center justify-between mb-3">
                      <span data-testid="product-price" class="text-lg font-bold text-blue-600">
                        {{ getFormattedPrice(product) }}
                      </span>
                      <!-- Stock Status -->
                      <div>
                        @if (isInStock(product)) {
                          <span class="text-xs text-green-600 font-medium"> In Stock </span>
                        }
                        @if (!isInStock(product)) {
                          <span class="text-xs text-red-600 font-medium"> Out of Stock </span>
                        }
                      </div>
                    </div>
                    <button
                      data-testid="quick-add-button"
                      class="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                      [disabled]="isAddingToCart[product.id] || !isInStock(product)"
                      (click)="quickAddToCart($event, product)"
                    >
                      @if (!isAddingToCart[product.id]) {
                        <span>Add to Cart</span>
                      }
                      @if (isAddingToCart[product.id]) {
                        <span class="flex items-center justify-center">
                          <div
                            class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"
                          ></div>
                          Adding...
                        </span>
                      }
                    </button>
                    <!-- Product Tags -->
                    @if (product.tags && product.tags.length > 0) {
                      <div class="mt-2 flex flex-wrap gap-1">
                        @for (tag of product.tags.slice(0, 3); track tag) {
                          <span
                            class="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full"
                          >
                            {{ tag.value }}
                          </span>
                        }
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          }

          <!-- Pagination -->
          @if (totalPages > 1) {
            <div data-testid="pagination" class="mt-12 flex justify-center">
              <nav class="flex items-center space-x-2">
                <button
                  class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                  [disabled]="currentPage === 1"
                  (click)="goToPage(currentPage - 1)"
                >
                  Previous
                </button>
                @for (page of getVisiblePages(); track page) {
                  <button
                    class="px-3 py-2 text-sm font-medium border rounded-md"
                    [class.bg-blue-600]="page === currentPage"
                    [class.text-white]="page === currentPage"
                    [class.border-blue-600]="page === currentPage"
                    [class.bg-white]="page !== currentPage"
                    [class.text-gray-700]="page !== currentPage"
                    [class.border-gray-300]="page !== currentPage"
                    [class.hover:bg-gray-50]="page !== currentPage"
                    (click)="goToPage(page)"
                  >
                    {{ page }}
                  </button>
                }
                <button
                  data-testid="pagination-next"
                  class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                  [disabled]="currentPage === totalPages"
                  (click)="goToPage(currentPage + 1)"
                >
                  Next
                </button>
              </nav>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    `,
  ],
})
export class ProductsComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  collections: ProductCollection[] = [];
  productTypes: ProductType[] = [];
  tags: ProductTag[] = [];

  totalProducts = 0;
  totalPages = 0;
  currentPage = 1;
  isLoading = true;
  hasError = false;
  isAddingToCart: { [productId: string]: boolean } = {};

  // Filter states
  searchQuery = '';
  selectedCollections: string[] = [];
  selectedTypes: string[] = [];
  selectedTags: string[] = [];
  priceRange = { min: null as number | null, max: null as number | null };
  sortBy = '';

  private subscriptions = new Subscription();

  constructor(
    private medusaApi: MedusaApiService,
    private cartService: CartService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // Load filter options
    this.loadCollections();
    this.loadProductTypes();
    this.loadTags();

    // Load initial products
    this.loadProducts();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  async loadProducts(): Promise<void> {
    this.isLoading = true;
    this.hasError = false;

    try {
      const params = this.buildApiParams();

      this.medusaApi.getProducts(params).subscribe({
        next: (products) => {
          this.products = products;
          this.totalProducts = products.length; // In real implementation, get from API response
          this.totalPages = Math.ceil(this.totalProducts / ITEMS_PER_PAGE);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading products:', error);
          this.hasError = true;
          this.isLoading = false;
        },
      });
    } catch (error) {
      console.error('Error loading products:', error);
      this.hasError = true;
      this.isLoading = false;
    }
  }

  private buildApiParams(): any {
    const params: any = {
      limit: ITEMS_PER_PAGE,
      offset: (this.currentPage - 1) * ITEMS_PER_PAGE,
    };

    if (this.searchQuery) {
      params.q = this.searchQuery;
    }

    if (this.selectedCollections.length > 0) {
      params.collection_id = this.selectedCollections;
    }

    if (this.selectedTypes.length > 0) {
      params.type_id = this.selectedTypes;
    }

    if (this.selectedTags.length > 0) {
      params.tags = this.selectedTags;
    }

    return params;
  }

  private async loadCollections(): Promise<void> {
    // In a real implementation, you'd have a collections endpoint
    this.collections = [];
  }

  private async loadProductTypes(): Promise<void> {
    // In a real implementation, you'd have a product types endpoint
    this.productTypes = [];
  }

  private async loadTags(): Promise<void> {
    // In a real implementation, you'd have a tags endpoint
    this.tags = [];
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  onCollectionChange(collectionId: string, event: any): void {
    if (event.target.checked) {
      this.selectedCollections.push(collectionId);
    } else {
      this.selectedCollections = this.selectedCollections.filter((id) => id !== collectionId);
    }
    this.currentPage = 1;
    this.loadProducts();
  }

  onTypeChange(typeId: string, event: any): void {
    if (event.target.checked) {
      this.selectedTypes.push(typeId);
    } else {
      this.selectedTypes = this.selectedTypes.filter((id) => id !== typeId);
    }
    this.currentPage = 1;
    this.loadProducts();
  }

  toggleTag(tagId: string): void {
    if (this.selectedTags.includes(tagId)) {
      this.selectedTags = this.selectedTags.filter((id) => id !== tagId);
    } else {
      this.selectedTags.push(tagId);
    }
    this.currentPage = 1;
    this.loadProducts();
  }

  onPriceRangeChange(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  onSortChange(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  clearAllFilters(): void {
    this.searchQuery = '';
    this.selectedCollections = [];
    this.selectedTypes = [];
    this.selectedTags = [];
    this.priceRange = { min: null, max: null };
    this.sortBy = '';
    this.currentPage = 1;
    this.loadProducts();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadProducts();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getVisiblePages(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;

    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  navigateToProduct(product: Product): void {
    this.router.navigate(['/products', product.handle || product.id]);
  }

  async quickAddToCart(event: Event, product: Product): Promise<void> {
    event.stopPropagation();

    const firstVariant = product.variants[0];
    if (!firstVariant) {
      console.error('Product has no variants');
      return;
    }

    this.isAddingToCart[product.id] = true;

    try {
      await this.cartService.addToCart(firstVariant.id).toPromise();
    } catch (error) {
      console.error('Error adding product to cart:', error);
    } finally {
      this.isAddingToCart[product.id] = false;
    }
  }

  getProductImage(product: Product): string {
    if (product.thumbnail) {
      return product.thumbnail;
    }
    if (product.images && product.images.length > 0) {
      return product.images[0].url;
    }
    return '/assets/placeholder-product.png';
  }

  getFormattedPrice(product: Product): string {
    const price = getProductPrice(product);
    return price ? formatPrice(price.amount, price.currency_code) : 'Price not available';
  }

  isInStock(product: Product): boolean {
    return isProductInStock(product);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = '/assets/placeholder-product.png';
  }

  trackByProductId(index: number, product: Product): string {
    return product.id;
  }
}
