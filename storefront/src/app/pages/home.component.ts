import {
  ChangeDetectionStrategy,
  Component,
  Signal,
  ViewEncapsulation,
  computed,
  inject,
} from '@angular/core';

import { RouterModule } from '@angular/router';
import { Product, formatPrice, getProductPrice } from '../../../../shared/src/types';
import { CartService } from '../services/cart.service';
import { ProductsApiService } from '../services/products-api.service';

@Component({
  selector: 'app-home',
  imports: [RouterModule],
  template: `
    <div class="min-h-screen">
      <!-- Hero Section -->
      <section
        data-testid="hero-section"
        class="bg-gradient-to-r from-blue-600 to-purple-700 text-white"
      >
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div class="text-center">
            <h1 class="text-4xl md:text-6xl font-bold mb-6">Welcome to Our Store</h1>
            <p class="text-xl md:text-2xl mb-8 text-blue-100">
              Discover amazing products at unbeatable prices
            </p>
            <button
              class="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
              (click)="scrollToProducts()"
            >
              Shop Now
            </button>
          </div>
        </div>
      </section>

      <!-- Featured Products Section -->
      <section class="py-16 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-12">
            <h2 class="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p class="text-lg text-gray-600">Check out our most popular items</p>
          </div>

          <!-- Loading State -->
          @if (isLoading()) {
            <div class="flex justify-center items-center py-12">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          }

          <!-- Error State -->
          @if (hasError() && !isLoading()) {
            <div data-testid="error-message" class="text-center py-12">
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
              <p class="text-lg text-gray-600 mb-4">Sorry, we couldn't load the products</p>
              <button
                class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                (click)="loadProducts()"
              >
                Try Again
              </button>
            </div>
          }

          <!-- Products Grid -->
          @if (!isLoading() && !hasError()) {
            <div
              data-testid="product-grid"
              class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              @for (product of featuredProducts(); track trackByProductId($index, product)) {
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
                    <div class="flex items-center justify-between">
                      <span data-testid="product-price" class="text-lg font-bold text-blue-600">
                        {{ getFormattedPrice(product) }}
                      </span>
                      <button
                        data-testid="quick-add-button"
                        class="bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                        [disabled]="isAddingToCart[product.id]"
                        (click)="quickAddToCart($event, product)"
                      >
                        @if (!isAddingToCart[product.id]) {
                          <span>Add to Cart</span>
                        }
                        @if (isAddingToCart[product.id]) {
                          <span class="flex items-center">
                            <div
                              class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"
                            ></div>
                            Adding...
                          </span>
                        }
                      </button>
                    </div>
                    <!-- Stock Status -->
                    <div class="mt-2">
                      @if (isInStock(product)) {
                        <span class="text-xs text-green-600 font-medium"> In Stock </span>
                      }
                      @if (!isInStock(product)) {
                        <span class="text-xs text-red-600 font-medium"> Out of Stock </span>
                      }
                    </div>
                  </div>
                </div>
              }
            </div>
          }

          <!-- View All Products Button -->
          @if (!isLoading() && featuredProducts().length > 0) {
            <div class="text-center mt-12">
              <a
                routerLink="/products"
                class="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                View All Products
              </a>
            </div>
          }
        </div>
      </section>

      <!-- Features Section -->
      <section class="py-16 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-12">
            <h2 class="text-3xl font-bold text-gray-900 mb-4">Why Choose Us</h2>
            <p class="text-lg text-gray-600">We make shopping easy and enjoyable</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="text-center">
              <div
                class="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4"
              >
                <svg
                  class="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  ></path>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">Free Shipping</h3>
              <p class="text-gray-600">Free shipping on orders over $50</p>
            </div>

            <div class="text-center">
              <div
                class="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4"
              >
                <svg
                  class="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">Quality Guarantee</h3>
              <p class="text-gray-600">30-day money-back guarantee</p>
            </div>

            <div class="text-center">
              <div
                class="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4"
              >
                <svg
                  class="w-8 h-8 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.5v19M2.5 12h19"
                  ></path>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">24/7 Support</h3>
              <p class="text-gray-600">Round-the-clock customer service</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Newsletter Section -->
      <section class="py-16 bg-blue-600">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 class="text-3xl font-bold text-white mb-4">Stay Updated</h2>
          <p class="text-xl text-blue-100 mb-8">Subscribe to get special offers and updates</p>

          <div class="max-w-md mx-auto flex">
            <input
              type="email"
              placeholder="Enter your email"
              class="flex-1 px-4 py-3 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <button
              class="bg-white text-blue-600 px-6 py-3 rounded-r-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private readonly productsApiService = inject(ProductsApiService);
  private readonly cartService = inject(CartService);

  private readonly productsResource = this.productsApiService.createProductsResource({ limit: 8 });

  protected readonly featuredProducts: Signal<Product[]> = computed(
    () => this.productsResource.value()?.products || [],
  );

  protected readonly isLoading = computed(() => this.productsResource.isLoading());
  protected readonly hasError = computed(() => !!this.productsResource.error());

  isAddingToCart: { [productId: string]: boolean } = {};

  protected loadProducts() {
    console.log('Loading products again...');
  }

  // async loadProducts(): Promise<void> {
  //   this.isLoading = true;
  //   this.hasError = false;

  //   try {
  //     this.medusaApi.getProducts({ limit: 8 }).subscribe({
  //       next: (products) => {
  //         this.featuredProducts = products;
  //         this.isLoading = false;
  //       },
  //       error: (error) => {
  //         console.error('Error loading products:', error);
  //         this.hasError = true;
  //         this.isLoading = false;
  //       },
  //     });
  //   } catch (error) {
  //     console.error('Error loading products:', error);
  //     this.hasError = true;
  //     this.isLoading = false;
  //   }
  // }

  navigateToProduct(product: Product): void {
    window.location.href = `/products/${product.handle || product.id}`;
  }

  async quickAddToCart(event: Event, product: Product): Promise<void> {
    event.stopPropagation(); // Prevent navigation to product page

    const firstVariant = product.variants[0];
    if (!firstVariant) {
      console.error('Product has no variants');
      return;
    }

    this.isAddingToCart[product.id] = true;

    try {
      await this.cartService.addToCart(firstVariant.id).toPromise();
      // Show success feedback (you could add a toast notification here)
      console.log('Product added to cart successfully');
    } catch (error) {
      console.error('Error adding product to cart:', error);
      // Show error feedback
    } finally {
      this.isAddingToCart[product.id] = false;
    }
  }

  scrollToProducts(): void {
    const element = document.querySelector('[data-testid="product-grid"]');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
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
    return product.variants.some(
      (variant) => variant.inventory_quantity > 0 || variant.allow_backorder,
    );
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = '/assets/placeholder-product.png';
  }

  trackByProductId(index: number, product: Product): string {
    return product.id;
  }
}
