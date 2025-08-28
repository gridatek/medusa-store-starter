import { httpResource, HttpResourceRequest } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { Cart, ENDPOINTS, STORAGE_KEYS } from '../../../../shared/src/types';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class CartStateService {
  private readonly configService = inject(ConfigService);

  private get apiBaseUrl(): string {
    return this.configService.medusaApiUrl;
  }

  // Cart Id signal - the source of truth
  private readonly cartId = signal<string | null>(this.getStoredCartId());

  // HTTP Resource for fetching cart data
  private readonly cartResource = httpResource<Cart>(
    () => {
      const id = this.cartId();
      if (!id) {
        return undefined; // Don't make request if no cart Id
      }

      const url = `${this.apiBaseUrl}${ENDPOINTS.CART_BY_ID(id)}`;

      return {
        url: url,
        method: 'GET',
      } as HttpResourceRequest;
    },
    {
      parse: (data) => {
        // Validate and transform cart data if needed
        return data as Cart;
      },
    },
  );

  // Public readonly computed signals
  readonly cart = computed(() => this.cartResource.value() ?? null);
  readonly isLoading = computed(() => this.cartResource.isLoading());
  readonly error = computed(() => this.cartResource.error());
  readonly cartId$ = this.cartId.asReadonly();

  constructor() {
    // Initialize cart if no cartId exists
    if (!this.cartId()) {
      this.createNewCart();
    }

    // Effect to sync cartId changes to localStorage (only when needed)
    effect(() => {
      const id = this.cartId();
      const storedId = this.getStoredCartId();

      if (id !== storedId) {
        if (id) {
          localStorage.setItem(STORAGE_KEYS.CART_ID, id);
        } else {
          localStorage.removeItem(STORAGE_KEYS.CART_ID);
        }
      }
    });

    // Effect to handle cart creation/loading errors
    effect(() => {
      const error = this.error();
      if (error) {
        console.error('Cart loading error:', error);
        // If cart doesn't exist, create a new one
        this.createNewCart();
      }
    });

    // Effects to handle mutation success and update the main cart
    effect(() => {
      const updatedCart = this.addItemResource.value();
      if (updatedCart) {
        // Clear trigger and refresh main cart
        this.addItemTrigger.set(null);
        this.cartResource.reload();
      }
    });

    effect(() => {
      const updatedCart = this.removeItemResource.value();
      if (updatedCart) {
        this.removeItemTrigger.set(null);
        this.cartResource.reload();
      }
    });

    effect(() => {
      const updatedCart = this.updateItemResource.value();
      if (updatedCart) {
        this.updateItemTrigger.set(null);
        this.cartResource.reload();
      }
    });

    effect(() => {
      const newCart = this.createCartResource.value();
      if (newCart) {
        // Set the new cart Id and clear the trigger
        this.cartId.set(newCart.id);
        this.createCartTrigger.set(false);
        // The main cartResource will automatically load due to cartId change
      }
    });

    // Effects to handle mutation errors
    effect(() => {
      const error = this.addItemResource.error();
      if (error) {
        console.error('Error adding item:', error);
        this.addItemTrigger.set(null); // Clear trigger
      }
    });

    effect(() => {
      const error = this.removeItemResource.error();
      if (error) {
        console.error('Error removing item:', error);
        this.removeItemTrigger.set(null);
      }
    });

    effect(() => {
      const error = this.updateItemResource.error();
      if (error) {
        console.error('Error updating item:', error);
        this.updateItemTrigger.set(null);
      }
    });

    effect(() => {
      const error = this.createCartResource.error();
      if (error) {
        console.error('Error creating cart:', error);
        this.createCartTrigger.set(false);
      }
    });
  }

  // Signals for triggering cart mutations
  private readonly addItemTrigger = signal<{ productId: string; quantity: number } | null>(null);
  private readonly removeItemTrigger = signal<{ itemId: string } | null>(null);
  private readonly updateItemTrigger = signal<{ itemId: string; quantity: number } | null>(null);
  private readonly createCartTrigger = signal<boolean>(false);

  // HTTP Resources for cart mutations
  private readonly addItemResource = httpResource<Cart>(() => {
    const trigger = this.addItemTrigger();
    const cartId = this.cartId();

    if (!trigger || !cartId) return undefined;

    return {
      url: `/api/cart/${cartId}/items`,
      method: 'POST',
      body: {
        product_id: trigger.productId,
        quantity: trigger.quantity,
      },
    } as HttpResourceRequest;
  });

  private readonly removeItemResource = httpResource<Cart>(() => {
    const trigger = this.removeItemTrigger();
    const cartId = this.cartId();

    if (!trigger || !cartId) return undefined;

    return {
      url: `/api/cart/${cartId}/items/${trigger.itemId}`,
      method: 'DELETE',
    } as HttpResourceRequest;
  });

  private readonly updateItemResource = httpResource<Cart>(() => {
    const trigger = this.updateItemTrigger();
    const cartId = this.cartId();

    if (!trigger || !cartId) return undefined;

    return {
      url: `/api/cart/${cartId}/items/${trigger.itemId}`,
      method: 'PUT',
      body: {
        quantity: trigger.quantity,
      },
    } as HttpResourceRequest;
  });

  private readonly createCartResource = httpResource<Cart>(() => {
    const shouldCreate = this.createCartTrigger();

    if (!shouldCreate) return undefined;

    return {
      url: '/api/cart',
      method: 'POST',
    } as HttpResourceRequest;
  });

  // Public methods for cart operations (subscription-free)
  addItem(productId: string, quantity: number): void {
    this.addItemTrigger.set({ productId, quantity });
  }

  removeItem(itemId: string): void {
    this.removeItemTrigger.set({ itemId });
  }

  updateItemQuantity(itemId: string, quantity: number): void {
    this.updateItemTrigger.set({ itemId, quantity });
  }

  // Public readonly signals for mutation states
  readonly isAddingItem = computed(() => this.addItemResource.isLoading());
  readonly isRemovingItem = computed(() => this.removeItemResource.isLoading());
  readonly isUpdatingItem = computed(() => this.updateItemResource.isLoading());

  readonly addItemError = computed(() => this.addItemResource.error());
  readonly removeItemError = computed(() => this.removeItemResource.error());
  readonly updateItemError = computed(() => this.updateItemResource.error());

  clearCart(): void {
    this.cartId.set(null);
    localStorage.removeItem(STORAGE_KEYS.CART_ID);
  }

  // Force refresh cart data
  refreshCart(): void {
    this.cartResource.reload();
  }

  // Create a new cart (useful for starting fresh)
  createNewCart(): void {
    this.createCartTrigger.set(true);
  }

  // Get stored cart Id from localStorage
  private getStoredCartId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEYS.CART_ID);
  }
}
