// Cart Page Component
// storefront/src/app/pages/cart.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';

import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartService } from '../services/cart.service';
import { Cart, CartSummary, LineItem, formatPrice } from '../../../../shared/src/types';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <!-- Empty Cart -->
      @if (!cart || cart.items.length === 0) {
        <div data-testid="empty-cart-message" class="text-center py-16">
          <svg
            class="mx-auto h-24 w-24 text-gray-400"
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
          <h2 class="mt-4 text-lg font-medium text-gray-900">Your cart is empty</h2>
          <p class="mt-2 text-gray-500">Start shopping to add items to your cart</p>
          <a
            routerLink="/products"
            class="mt-6 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </a>
        </div>
      }

      <!-- Cart Items -->
      @if (cart && cart.items.length > 0) {
        <div class="lg:grid lg:grid-cols-12 lg:gap-x-12">
          <div class="lg:col-span-7">
            <div class="space-y-6">
              @for (item of cart.items; track trackByItemId($index, item)) {
                <div
                  data-testid="cart-item"
                  class="flex items-center space-x-4 border-b border-gray-200 pb-6"
                >
                  <!-- Product Image -->
                  <div class="flex-shrink-0">
                    <img
                      data-testid="item-image"
                      [src]="item.thumbnail || '/assets/placeholder-product.png'"
                      [alt]="item.title"
                      class="w-20 h-20 object-cover rounded-lg"
                    />
                  </div>
                  <!-- Product Details -->
                  <div class="flex-1 min-w-0">
                    <h3 data-testid="item-title" class="text-lg font-medium text-gray-900">
                      {{ item.title }}
                    </h3>
                    <p class="text-sm text-gray-500">{{ item.description }}</p>
                    <p data-testid="item-price" class="text-lg font-semibold text-gray-900 mt-1">
                      {{ formatPrice(item.unit_price) }}
                    </p>
                  </div>
                  <!-- Quantity Controls -->
                  <div class="flex items-center space-x-2">
                    <button
                      data-testid="decrease-quantity"
                      class="p-1 rounded-md border border-gray-300 hover:bg-gray-50"
                      (click)="updateQuantity(item.id, item.quantity - 1)"
                      [disabled]="isUpdating[item.id]"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M20 12H4"
                        ></path>
                      </svg>
                    </button>
                    <span
                      data-testid="item-quantity"
                      class="px-3 py-1 border border-gray-300 rounded-md min-w-[3rem] text-center"
                    >
                      {{ item.quantity }}
                    </span>
                    <button
                      data-testid="increase-quantity"
                      class="p-1 rounded-md border border-gray-300 hover:bg-gray-50"
                      (click)="updateQuantity(item.id, item.quantity + 1)"
                      [disabled]="isUpdating[item.id]"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 4v16m8-8H4"
                        ></path>
                      </svg>
                    </button>
                  </div>
                  <!-- Remove Button -->
                  <button
                    data-testid="remove-item"
                    class="text-red-600 hover:text-red-800 p-2"
                    (click)="removeItem(item.id)"
                    [disabled]="isUpdating[item.id]"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      ></path>
                    </svg>
                  </button>
                </div>
              }
            </div>
          </div>
          <!-- Order Summary -->
          <div class="lg:col-span-5 mt-10 lg:mt-0">
            <div class="bg-gray-50 rounded-lg p-6 sticky top-24">
              <h2 class="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
              <div class="space-y-4">
                <div class="flex justify-between">
                  <span>Subtotal</span>
                  <span data-testid="cart-subtotal">{{ formatPrice(cartSummary.subtotal) }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Shipping</span>
                  <span>{{
                    cartSummary.shipping > 0 ? formatPrice(cartSummary.shipping) : 'Free'
                  }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Tax</span>
                  <span>{{ formatPrice(cartSummary.tax) }}</span>
                </div>
                @if (cartSummary.discount > 0) {
                  <div class="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{{ formatPrice(cartSummary.discount) }}</span>
                  </div>
                }
                <div class="border-t border-gray-200 pt-4">
                  <div class="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span data-testid="cart-total">{{ formatPrice(cartSummary.total) }}</span>
                  </div>
                </div>
              </div>
              <button
                data-testid="checkout-button"
                class="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                (click)="proceedToCheckout()"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class CartComponent implements OnInit, OnDestroy {
  cart: Cart | null = null;
  cartSummary: CartSummary = {
    subtotal: 0,
    shipping: 0,
    tax: 0,
    discount: 0,
    total: 0,
    itemCount: 0,
  };
  isUpdating: { [itemId: string]: boolean } = {};

  private subscriptions = new Subscription();

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.cartService.getCart().subscribe((cart) => {
        this.cart = cart;
      }),
    );

    this.subscriptions.add(
      this.cartService.getCartSummary().subscribe((summary) => {
        this.cartSummary = summary;
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  async updateQuantity(itemId: string, newQuantity: number): Promise<void> {
    this.isUpdating[itemId] = true;

    try {
      await this.cartService.updateItemQuantity(itemId, newQuantity).toPromise();
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      this.isUpdating[itemId] = false;
    }
  }

  async removeItem(itemId: string): Promise<void> {
    this.isUpdating[itemId] = true;

    try {
      await this.cartService.removeItem(itemId).toPromise();
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      this.isUpdating[itemId] = false;
    }
  }

  proceedToCheckout(): void {
    window.location.href = '/checkout';
  }

  formatPrice(amount: number, currencyCode: string = 'usd'): string {
    return formatPrice(amount, currencyCode);
  }

  trackByItemId(index: number, item: LineItem): string {
    return item.id;
  }
}
