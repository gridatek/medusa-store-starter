import {
  Component,
  OnDestroy,
  OnInit,
  Signal,
  WritableSignal,
  computed,
  inject,
  linkedSignal,
} from '@angular/core';

import { ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  Product,
  ProductVariant,
  formatPrice,
  getProductImages,
} from '../../../../shared/src/types';
import { CartService } from '../services/cart.service';
import { MedusaApiService } from '../services/medusa-api.service';
import { ProductsApiService } from '../services/products-api.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-product-detail',
  imports: [],
  template: `
    <div data-testid="product-detail" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading State -->
      @if (isLoading()) {
        <div class="flex justify-center items-center py-24">
          <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        </div>
      }

      <!-- Error State -->
      @if (hasError() && !isLoading()) {
        <div class="text-center py-24">
          <div class="text-red-500 mb-4">
            <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              ></path>
            </svg>
          </div>
          <p class="text-lg text-gray-600 mb-4">Product not found</p>
          <a
            href="/"
            class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </a>
        </div>
      }

      <!-- Product Content -->
      @if (product() && !isLoading()) {
        <div class="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
          <!-- Image Gallery -->
          <div data-testid="product-images" class="flex flex-col-reverse">
            <!-- Thumbnail Images -->
            <div class="hidden mt-6 w-full max-w-2xl mx-auto sm:block lg:max-w-none">
              @if (productImages.length > 1) {
                <div class="grid grid-cols-4 gap-6">
                  @for (image of productImages; track image; let i = $index) {
                    <button
                      data-testid="image-thumbnail"
                      class="relative h-24 bg-white rounded-md flex items-center justify-center text-sm font-medium uppercase text-gray-900 cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring focus:ring-offset-4 focus:ring-blue-500"
                      [class.ring-2]="selectedImageIndex === i"
                      [class.ring-blue-500]="selectedImageIndex === i"
                      (click)="selectImage(i)"
                    >
                      <span class="sr-only">{{ product()?.title }} image {{ i + 1 }}</span>
                      <span class="absolute inset-0 rounded-md overflow-hidden">
                        <img
                          [src]="image"
                          [alt]="product()?.title"
                          class="w-full h-full object-center object-cover"
                        />
                      </span>
                    </button>
                  }
                </div>
              }
            </div>
            <!-- Main Image -->
            <div class="w-full aspect-w-1 aspect-h-1">
              <img
                data-testid="main-product-image"
                [src]="getCurrentImage()"
                [alt]="product()?.title"
                class="w-full h-full object-center object-cover sm:rounded-lg"
                (error)="onImageError($event)"
              />
            </div>
          </div>
          <!-- Product Info -->
          <div class="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
            <h1 data-testid="product-title" class="text-3xl font-bold tracking-tight text-gray-900">
              {{ product()?.title }}
            </h1>
            <div class="mt-3">
              <h2 class="sr-only">Product information</h2>
              <p data-testid="product-price" class="text-3xl tracking-tight text-gray-900">
                {{ getCurrentPrice() }}
              </p>
            </div>
            <!-- Reviews placeholder -->
            <div class="mt-3 flex items-center">
              <div class="flex items-center">
                @for (star of [1, 2, 3, 4, 5]; track star) {
                  <svg class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.95-.69l1.07-3.292z"
                    ></path>
                  </svg>
                }
              </div>
              <p class="ml-3 text-sm text-gray-500">4.5 out of 5 stars (123 reviews)</p>
            </div>
            <div class="mt-6">
              <h3 class="sr-only">Description</h3>
              <div data-testid="product-description" class="text-base text-gray-700 space-y-6">
                <p>{{ product()?.description }}</p>
              </div>
            </div>
            <!-- Variant Selection -->
            @if ((product()?.variants?.length ?? 0) > 1) {
              <div class="mt-8">
                <div class="flex items-center justify-between">
                  <h3 class="text-lg font-medium text-gray-900">Options</h3>
                </div>
                <div class="mt-4 space-y-4">
                  @for (option of product()?.options; track option) {
                    <div class="space-y-2">
                      <h4 class="text-sm font-medium text-gray-700">{{ option.title }}</h4>
                      <div class="flex flex-wrap gap-2">
                        @for (value of getOptionValues(option.id); track value) {
                          <button
                            data-testid="variant-option"
                            class="px-3 py-2 text-sm border rounded-md hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            [class.border-blue-500]="isOptionSelected(option.id, value.id)"
                            [class.bg-blue-50]="isOptionSelected(option.id, value.id)"
                            (click)="selectOption(option.id, value.id)"
                          >
                            {{ value.value }}
                          </button>
                        }
                      </div>
                    </div>
                  }
                </div>
              </div>
            }
            <!-- Quantity Selector -->
            <div class="mt-8 flex items-center space-x-4">
              <div class="flex items-center">
                <label for="quantity" class="text-sm font-medium text-gray-700 mr-4"
                  >Quantity:</label
                >
                <div class="flex items-center border border-gray-300 rounded-md">
                  <button
                    data-testid="quantity-decrease"
                    class="px-3 py-2 text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    [disabled]="quantity <= 1"
                    (click)="decreaseQuantity()"
                  >
                    -
                  </button>
                  <input
                    data-testid="quantity-input"
                    type="number"
                    id="quantity"
                    [value]="quantity"
                    min="1"
                    max="10"
                    class="w-16 px-3 py-2 text-center border-0 focus:outline-none focus:ring-0"
                    (input)="onQuantityChange($event)"
                  />
                  <button
                    data-testid="quantity-increase"
                    class="px-3 py-2 text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    [disabled]="quantity >= 10"
                    (click)="increaseQuantity()"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            <!-- Stock Status -->
            <div class="mt-4">
              @if (selectedVariant() && selectedVariant()?.inventory_quantity > 0) {
                <div class="flex items-center text-green-600">
                  <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                  <span class="text-sm font-medium"
                    >In Stock ({{ selectedVariant()?.inventory_quantity }} available)</span
                  >
                </div>
              }
              @if (
                selectedVariant() &&
                selectedVariant()?.inventory_quantity === 0 &&
                selectedVariant()?.allow_backorder
              ) {
                <div class="flex items-center text-yellow-600">
                  <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                  <span class="text-sm font-medium">Available for Backorder</span>
                </div>
              }
              @if (
                selectedVariant() &&
                selectedVariant()?.inventory_quantity === 0 &&
                !selectedVariant()?.allow_backorder
              ) {
                <div class="flex items-center text-red-600">
                  <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                  <span class="text-sm font-medium">Out of Stock</span>
                </div>
              }
            </div>
            <!-- Add to Cart Button -->
            <div class="mt-8">
              <button
                data-testid="add-to-cart-button"
                type="button"
                class="w-full bg-blue-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                [disabled]="!canAddToCart() || isAddingToCart"
                (click)="addToCart()"
              >
                @if (!isAddingToCart) {
                  <span>Add to Cart</span>
                }
                @if (isAddingToCart) {
                  <span class="flex items-center">
                    <div
                      class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"
                    ></div>
                    Adding to Cart...
                  </span>
                }
              </button>
            </div>
            <!-- Product Details -->
            <div class="mt-10 border-t border-gray-200 pt-8">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Product Details</h3>
              <div class="space-y-4">
                @if (selectedVariant()?.sku) {
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-500">SKU:</span>
                    <span class="text-sm text-gray-900">{{ selectedVariant()?.sku }}</span>
                  </div>
                }
                @if (product()?.weight) {
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-500">Weight:</span>
                    <span class="text-sm text-gray-900">{{ product()?.weight }}g</span>
                  </div>
                }
                @if (product()?.material) {
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-500">Material:</span>
                    <span class="text-sm text-gray-900">{{ product()?.material }}</span>
                  </div>
                }
                @if (product()?.origin_country) {
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-500">Origin:</span>
                    <span class="text-sm text-gray-900">{{ product()?.origin_country }}</span>
                  </div>
                }
              </div>
            </div>
            <!-- Tags -->
            @if (product()?.tags && product()?.tags?.length > 0) {
              <div class="mt-8">
                <h3 class="text-sm font-medium text-gray-900 mb-3">Tags</h3>
                <div class="flex flex-wrap gap-2">
                  @for (tag of product()?.tags; track tag) {
                    <span
                      class="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full"
                    >
                      {{ tag.value }}
                    </span>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [],
})
export class ProductDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly medusaApi = inject(MedusaApiService);
  private readonly cartService = inject(CartService);

  private readonly productsApiService = inject(ProductsApiService);

  // Convert route params to signal with proper typing
  private readonly routeParams = toSignal(this.route.params, {
    initialValue: {} as Params,
  });

  // Extract productId as a computed signal with proper type assertion
  private readonly productId = computed(() => {
    const params = this.routeParams();
    return params?.['id'] as string | undefined;
  });

  private readonly productsResource = this.productsApiService.createProductResource(
    this.productId(),
  );

  protected readonly product: Signal<Product | null> = computed(
    () => this.productsResource?.value()?.product ?? null,
  );

  protected readonly selectedVariant: WritableSignal<ProductVariant | null> = linkedSignal(
    () => this.productsResource?.value()?.product?.variants[0] ?? null,
  );

  selectedOptions: { [optionId: string]: string } = {};
  quantity = 1;
  selectedImageIndex = 0;
  productImages: string[] = [];
  protected readonly isLoading = computed(() => this.productsResource?.isLoading() ?? false);
  protected readonly hasError = computed(() => !!this.productsResource?.error());
  isAddingToCart = false;

  // private loadProduct(productId: string): void {
  //   this.isLoading = true;
  //   this.hasError = false;

  //   this.medusaApi.getProduct(productId).subscribe({
  //     next: (product) => {
  //       this.product = product;
  //       this.productImages = getProductImages(product);
  //       this.selectedVariant = product.variants[0] || null;
  //       this.initializeOptions();
  //       this.isLoading = false;
  //     },
  //     error: (error) => {
  //       console.error('Error loading product:', error);
  //       this.hasError = true;
  //       this.isLoading = false;
  //     },
  //   });
  // }

  private initializeOptions(): void {
    if (!this.product || !this.selectedVariant) return;

    this.selectedVariant()?.options.forEach((option) => {
      this.selectedOptions[option.option_id] = option.id;
    });
  }

  selectImage(index: number): void {
    this.selectedImageIndex = index;
  }

  getCurrentImage(): string {
    if (this.productImages.length === 0) {
      return '/assets/placeholder-product.png';
    }
    return this.productImages[this.selectedImageIndex] || this.productImages[0];
  }

  getCurrentPrice(): string {
    if (!this.selectedVariant) return 'Price not available';

    const price = this.selectedVariant()?.prices[0];
    return price ? formatPrice(price.amount, price.currency_code) : 'Price not available';
  }

  getOptionValues(optionId: string) {
    if (!this.product) return [];

    const option = this.product()?.options.find((opt) => opt.id === optionId);
    return option ? option.values : [];
  }

  isOptionSelected(optionId: string, valueId: string): boolean {
    return this.selectedOptions[optionId] === valueId;
  }

  selectOption(optionId: string, valueId: string): void {
    this.selectedOptions[optionId] = valueId;
    this.updateSelectedVariant();
  }

  private updateSelectedVariant(): void {
    if (!this.product) return;

    const variant = this.product()?.variants.find((variant) =>
      variant.options.every((option) => this.selectedOptions[option.option_id] === option.id),
    );

    if (variant) {
      this.selectedVariant.set(variant);
    }
  }

  increaseQuantity(): void {
    if (this.quantity < 10) {
      this.quantity++;
    }
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  onQuantityChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = parseInt(target.value, 10);

    if (value >= 1 && value <= 10) {
      this.quantity = value;
    }
  }

  canAddToCart(): boolean {
    return !!(
      this.selectedVariant &&
      (this.selectedVariant()?.inventory_quantity > 0 || this.selectedVariant()?.allow_backorder)
    );
  }

  async addToCart(): Promise<void> {
    if (!this.selectedVariant || this.isAddingToCart) return;

    this.isAddingToCart = true;

    try {
      await this.cartService.addToCart(this.selectedVariant()?.id, this.quantity).toPromise();
      // Show success message (you could add a toast notification here)
      console.log('Product added to cart successfully');
    } catch (error) {
      console.error('Error adding product to cart:', error);
      // Show error message
    } finally {
      this.isAddingToCart = false;
    }
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = '/assets/placeholder-product.png';
  }
}
