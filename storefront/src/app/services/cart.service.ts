// storefront/src/app/services/cart.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';
import { MedusaApiService } from './medusa-api.service';
import { Cart, CartSummary, STORAGE_KEYS, calculateCartTotals } from '../../../../shared/src/types';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cart$ = new BehaviorSubject<Cart | null>(null);
  private cartSummary$ = new BehaviorSubject<CartSummary>({
    subtotal: 0,
    shipping: 0,
    tax: 0,
    discount: 0,
    total: 0,
    itemCount: 0,
  });

  constructor(private medusaApi: MedusaApiService) {}

  async initializeCart(): Promise<void> {
    try {
      const cartId = this.getCartIdFromStorage();

      if (cartId) {
        // Try to retrieve existing cart
        this.medusaApi.getCart(cartId).subscribe({
          next: (cart) => this.updateCart(cart),
          error: () => this.createNewCart(),
        });
      } else {
        this.createNewCart();
      }
    } catch (error) {
      console.error('Error initializing cart:', error);
      this.createNewCart();
    }
  }

  private createNewCart(): void {
    this.medusaApi.createCart().subscribe({
      next: (cart) => {
        this.updateCart(cart);
        this.saveCartIdToStorage(cart.id);
      },
      error: (error) => console.error('Error creating cart:', error),
    });
  }

  private updateCart(cart: Cart): void {
    this.cart$.next(cart);
    this.cartSummary$.next(calculateCartTotals(cart));
  }

  getCart(): Observable<Cart | null> {
    return this.cart$.asObservable();
  }

  getCartSummary(): Observable<CartSummary> {
    return this.cartSummary$.asObservable();
  }

  addToCart(variantId: string, quantity: number = 1): Observable<Cart> {
    const currentCart = this.cart$.value;
    if (!currentCart) {
      throw new Error('No active cart');
    }

    return this.medusaApi
      .addToCart(currentCart.id, variantId, quantity)
      .pipe(tap((cart) => this.updateCart(cart)));
  }

  updateItemQuantity(itemId: string, quantity: number): Observable<Cart> {
    const currentCart = this.cart$.value;
    if (!currentCart) {
      throw new Error('No active cart');
    }

    if (quantity <= 0) {
      return this.removeItem(itemId);
    }

    return this.medusaApi
      .updateCartItem(currentCart.id, itemId, quantity)
      .pipe(tap((cart) => this.updateCart(cart)));
  }

  removeItem(itemId: string): Observable<Cart> {
    const currentCart = this.cart$.value;
    if (!currentCart) {
      throw new Error('No active cart');
    }

    return this.medusaApi
      .removeFromCart(currentCart.id, itemId)
      .pipe(tap((cart) => this.updateCart(cart)));
  }

  clearCart(): Observable<Cart> {
    const currentCart = this.cart$.value;
    if (!currentCart) {
      throw new Error('No active cart');
    }

    // Remove all items from cart
    const removePromises = currentCart.items.map((item) =>
      this.medusaApi.removeFromCart(currentCart.id, item.id).toPromise(),
    );

    return new Observable<Cart>((observer) => {
      Promise.all(removePromises)
        .then(() => {
          const updatedCart = { ...currentCart, items: [] };
          this.updateCart(updatedCart);
          observer.next(updatedCart);
          observer.complete();
        })
        .catch((error) => observer.error(error));
    });
  }

  getTotalItems(): number {
    const cart = this.cart$.value;
    return cart ? cart.items.reduce((total, item) => total + item.quantity, 0) : 0;
  }

  getItemQuantity(variantId: string): number {
    const cart = this.cart$.value;
    if (!cart) return 0;

    const item = cart.items.find((item) => item.variant_id === variantId);
    return item ? item.quantity : 0;
  }

  isItemInCart(variantId: string): boolean {
    return this.getItemQuantity(variantId) > 0;
  }

  private getCartIdFromStorage(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.CART_ID);
    }
    return null;
  }

  private saveCartIdToStorage(cartId: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.CART_ID, cartId);
    }
  }

  private removeCartIdFromStorage(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.CART_ID);
    }
  }
}
