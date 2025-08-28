import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { Cart, STORAGE_KEYS } from '../../../../shared/src/types';
import { CartService } from './cart.service';
import { MedusaApiService } from './medusa-api.service';

@Injectable({
  providedIn: 'root',
})
export class CartStateService {
  private readonly cartService = inject(CartService);
  private readonly medusaApi = inject(MedusaApiService);

  private readonly cart = signal<Cart | null>({ id: this.getStoredCartId() } as Cart);

  // Cart ID signal - synced with localStorage
  private readonly cartId = computed<string | null>(() => this.cart()?.id || null);

  constructor() {
    // Initialize cart if no cartId exists
    const id = this.cartId();
    if (!id) {
      this.createNewCart();
    } else {
      this.medusaApi.getCart(id).subscribe({
        next: (cart) => this.cart.set(cart),
        error: (error) => console.error('Error creating cart:', error),
      });
    }
  }

  private createNewCart(): void {
    this.medusaApi.createCart().subscribe({
      next: (cart) => {
        this.cart.set(cart);
      },
      error: (error) => console.error('Error creating cart:', error),
    });
  }

  // Effect to sync cartId changes to localStorage
  private readonly cartIdSyncEffect = effect(() => {
    const id = this.cartId();
    if (id) {
      localStorage.setItem(STORAGE_KEYS.CART_ID, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CART_ID);
    }
  });

  // Get stored cart ID from localStorage
  private getStoredCartId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEYS.CART_ID);
  }
}
