import { Component, OnDestroy, OnInit, Signal, computed, inject, signal } from '@angular/core';

import { toSignal } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs/operators';
import {
  CartSummary,
  Customer,
  Product,
  SEARCH_DEBOUNCE_TIME,
  formatPrice,
  getProductPrice,
} from '../../../../shared/src/types';
import { AuthService } from '../services/auth.service';
import { CartService } from '../services/cart.service';
import { MedusaApiService } from '../services/medusa-api.service';
import { AuthModalComponent } from './auth-modal.component';

@Component({
  selector: 'app-header',
  imports: [RouterModule, AuthModalComponent],
  template: `
    <header
      data-testid="header"
      class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <a
              routerLink="/"
              data-testid="logo"
              class="flex items-center space-x-2 text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors"
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
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                ></path>
              </svg>
              <span>Store</span>
            </a>
          </div>

          <!-- Desktop Navigation -->
          <nav class="hidden md:flex items-center space-x-8">
            <a
              routerLink="/products"
              data-testid="category-link"
              class="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
            >
              Products
            </a>
            <a
              routerLink="/collections"
              data-testid="category-link"
              class="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
            >
              Collections
            </a>
            <a
              routerLink="/about"
              data-testid="category-link"
              class="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
            >
              About
            </a>
          </nav>

          <!-- Search Bar -->
          <div class="flex-1 max-w-lg mx-8 relative">
            <div class="relative">
              <input
                data-testid="search-input"
                type="text"
                placeholder="Search products..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                (input)="onSearchInput($event)"
                (focus)="onSearchFocus()"
                (blur)="onSearchBlur()"
                [value]="searchQuery"
              />
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  class="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
              </div>
              @if (isSearchLoading()) {
                <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                </div>
              }
            </div>

            <!-- Search Results Dropdown -->
            @if (showSearchResults() && (searchResults().length > 0 || showNoResults())) {
              <div
                data-testid="search-results"
                class="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50"
              >
                <!-- Results -->
                @if (searchResults().length > 0) {
                  <div class="py-2">
                    @for (product of searchResults(); track product.id) {
                      <div
                        data-testid="search-result-item"
                        class="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        (click)="onProductClick(product)"
                      >
                        <div class="flex items-center space-x-3">
                          <img
                            [src]="product.thumbnail || '/assets/placeholder-product.png'"
                            [alt]="product.title"
                            class="w-12 h-12 object-cover rounded-md flex-shrink-0"
                          />
                          <div class="flex-1 min-w-0">
                            <h3
                              data-testid="product-name"
                              class="text-sm font-medium text-gray-900 truncate"
                            >
                              {{ product.title }}
                            </h3>
                            <p class="text-sm text-gray-500 truncate">
                              {{ product.description }}
                            </p>
                            <p
                              data-testid="product-price"
                              class="text-sm font-semibold text-blue-600"
                            >
                              {{ getFormattedPrice(product) }}
                            </p>
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                }
                <!-- No Results -->
                @if (searchResults().length === 0 && showNoResults()) {
                  <div data-testid="no-results-message" class="px-4 py-8 text-center">
                    <div class="text-gray-400 mb-2">
                      <svg
                        class="w-12 h-12 mx-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        ></path>
                      </svg>
                    </div>
                    <p class="text-sm text-gray-500">No results found</p>
                    <p class="text-xs text-gray-400 mt-1">Try different keywords</p>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Auth Modal -->
          <app-auth-modal
            [isOpen]="showAuthModal"
            (closeEvent)="closeAuthModal()"
            (authSuccess)="onAuthSuccess()"
          />

          <!-- Right Side Actions -->
          <div class="flex items-center space-x-4">
            <!-- User Account - when logged in -->
            @if (currentCustomer) {
              <div class="relative group">
                <button
                  data-testid="user-menu-button"
                  class="flex items-center space-x-2 text-gray-600 hover:text-gray-900 p-2 transition-colors"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    ></path>
                  </svg>
                  <span class="hidden md:block">{{ currentCustomer.first_name || 'Account' }}</span>
                </button>
                <!-- Dropdown Menu -->
                <div
                  class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200"
                >
                  <a
                    routerLink="/account"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >My Account</a
                  >
                  <a
                    routerLink="/account/orders"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >Orders</a
                  >
                  <button
                    (click)="logout()"
                    class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            }

            <!-- User Account - when not logged in -->
            @if (!currentCustomer) {
              <button
                data-testid="login-button"
                class="text-gray-600 hover:text-gray-900 p-2 transition-colors"
                (click)="toggleAuthModal()"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  ></path>
                </svg>
              </button>
            }

            <!-- Cart -->
            <button
              data-testid="cart-button"
              class="relative text-gray-600 hover:text-gray-900 p-2 transition-colors"
              (click)="toggleCart()"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5H3M7 13l-1.6 8h9.2M9 19v2m6-2v2"
                ></path>
              </svg>
              @if (cartSummary.itemCount > 0) {
                <span
                  data-testid="cart-counter"
                  class="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium"
                >
                  {{ cartSummary.itemCount }}
                </span>
              }
            </button>

            <!-- Mobile Menu Button -->
            <button
              data-testid="mobile-menu-button"
              class="md:hidden text-gray-600 hover:text-gray-900 p-2"
              (click)="toggleMobileMenu()"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                @if (!showMobileMenu) {
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  ></path>
                }
                @if (showMobileMenu) {
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                }
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Menu -->
      @if (showMobileMenu) {
        <div data-testid="mobile-menu" class="md:hidden bg-white border-t border-gray-200">
          <div class="px-2 pt-2 pb-3 space-y-1">
            <a
              routerLink="/products"
              class="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
              (click)="closeMobileMenu()"
            >
              Products
            </a>
            <a
              routerLink="/collections"
              class="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
              (click)="closeMobileMenu()"
            >
              Collections
            </a>
            <a
              routerLink="/about"
              class="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
              (click)="closeMobileMenu()"
            >
              About
            </a>
          </div>
        </div>
      }

      <!-- Search Results Overlay -->
      @if (showSearchResults()) {
        <div class="fixed inset-0 z-40 bg-transparent" (click)="closeSearchResults()"></div>
      }
    </header>
  `,
  styles: [],
})
export class HeaderComponent implements OnInit, OnDestroy {
  private readonly cartService = inject(CartService);
  private readonly medusaApi = inject(MedusaApiService);
  private readonly authService = inject(AuthService);

  private readonly searchSubject = new Subject<string>();
  private readonly subscriptions = new Subscription();

  private readonly debouncedSearchQuery = toSignal(
    this.searchSubject.pipe(
      debounceTime(SEARCH_DEBOUNCE_TIME),
      distinctUntilChanged(),
      startWith(''), // Provide initial value
    ),
    { initialValue: '' },
  );

  private readonly productsResource = this.medusaApi.searchProducts(this.debouncedSearchQuery());

  searchQuery = '';

  protected readonly searchResults: Signal<Product[]> = computed(
    () => this.productsResource.value()?.products || [],
  );

  protected readonly showSearchResults = signal(false);
  protected readonly showNoResults = computed(
    () => this.searchResults().length === 0 || !!this.productsResource.error(),
  );
  protected readonly isSearchLoading = computed(() => this.productsResource.isLoading());
  showMobileMenu = false;
  showAuthModal = false;
  currentCustomer: Customer | null = null;
  cartSummary: CartSummary = {
    subtotal: 0,
    shipping: 0,
    tax: 0,
    discount: 0,
    total: 0,
    itemCount: 0,
  };

  ngOnInit(): void {
    // Setup search debouncing
    // this.subscriptions.add(
    //   this.searchSubject
    //     .pipe(
    //       debounceTime(SEARCH_DEBOUNCE_TIME),
    //       distinctUntilChanged(),
    //       switchMap((query) => {
    //         if (query.length < 2) {
    //           return [];
    //         }
    //         this.isSearchLoading = true;
    //         return this.medusaApi.searchProducts(query);
    //       }),
    //     )
    //     .subscribe({
    //       next: (products) => {
    //         this.searchResults = products;
    //         this.showNoResults = products.length === 0;
    //         this.isSearchLoading = false;
    //       },
    //       error: (error) => {
    //         console.error('Search error:', error);
    //         this.searchResults = [];
    //         this.showNoResults = true;
    //         this.isSearchLoading = false;
    //       },
    //     }),
    // );

    // Subscribe to cart updates
    this.subscriptions.add(
      this.cartService.getCartSummary().subscribe((summary) => {
        this.cartSummary = summary;
      }),
    );

    // Subscribe to auth state
    this.subscriptions.add(
      this.authService.getCustomer().subscribe((customer) => {
        this.currentCustomer = customer;
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery = target.value;

    if (this.searchQuery.trim()) {
      this.showSearchResults.set(true);
      this.searchSubject.next(this.searchQuery.trim());
    } else {
      this.clearSearch();
    }
  }

  onSearchFocus(): void {
    if (this.searchResults().length > 0 || this.showNoResults()) {
      this.showSearchResults.set(true);
    }
  }

  onSearchBlur(): void {
    // Delay hiding results to allow for clicks
    setTimeout(() => {
      this.showSearchResults.set(false);
    }, 200);
  }

  onProductClick(product: Product): void {
    window.location.href = `/products/${product.handle || product.id}`;
    this.closeSearchResults();
  }

  closeSearchResults(): void {
    this.showSearchResults.set(false);
  }

  protected clearSearch(): void {
    this.productsResource.set(undefined);
    // this.searchResults = [];
    this.showSearchResults.set(false);
    // this.showNoResults = false;
    // this.isSearchLoading = false;
  }

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }

  closeMobileMenu(): void {
    this.showMobileMenu = false;
  }

  toggleAuthModal(): void {
    this.showAuthModal = !this.showAuthModal;
  }

  closeAuthModal(): void {
    this.showAuthModal = false;
  }

  onAuthSuccess(): void {
    console.log('Authentication successful');
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      window.location.reload();
    });
  }

  toggleCart(): void {
    window.location.href = '/cart';
  }

  getFormattedPrice(product: Product): string {
    const price = getProductPrice(product);
    return price ? formatPrice(price.amount, price.currency_code) : 'Price not available';
  }
}
