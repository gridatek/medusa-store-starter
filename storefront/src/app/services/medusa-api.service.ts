// storefront/src/app/services/medusa-api.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, throwError, switchMap } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {
  Product,
  ProductsResponse,
  ProductResponse,
  Cart,
  CartResponse,
  Region,
  RegionsResponse,
  API_BASE_URL,
  ENDPOINTS,
  DEFAULT_REGION,
} from '../../../../shared/src/types';

@Injectable({
  providedIn: 'root',
})
export class MedusaApiService {
  private currentRegion$ = new BehaviorSubject<Region | null>(null);

  async initializeRegion(): Promise<void> {
    try {
      const regions = await this.getRegions().toPromise();
      if (regions && regions.length > 0) {
        this.currentRegion$.next(regions[0]);
      }
    } catch (error) {
      console.error('Failed to initialize region:', error);
    }
  }

  getCurrentRegion(): Observable<Region | null> {
    return this.currentRegion$.asObservable();
  }

  // Products
  getProducts(params?: {
    offset?: number;
    limit?: number;
    q?: string;
    collection_id?: string[];
    type_id?: string[];
    tags?: string[];
    region_id?: string;
  }): Observable<Product[]> {
    const queryParams = new URLSearchParams();

    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.q) queryParams.append('q', params.q);
    if (params?.collection_id) {
      params.collection_id.forEach((id) => queryParams.append('collection_id', id));
    }
    if (params?.type_id) {
      params.type_id.forEach((id) => queryParams.append('type_id', id));
    }
    if (params?.tags) {
      params.tags.forEach((tag) => queryParams.append('tags', tag));
    }
    if (params?.region_id) queryParams.append('region_id', params.region_id);

    const url = `${API_BASE_URL}${ENDPOINTS.PRODUCTS}?${queryParams.toString()}`;

    return from(fetch(url)).pipe(
      switchMap(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = (await response.json()) as ProductsResponse;
        return data.products;
      }),
      catchError((error) => {
        console.error('Error fetching products:', error);
        return throwError(error);
      }),
    );
  }

  getProduct(id: string): Observable<Product> {
    const url = `${API_BASE_URL}${ENDPOINTS.PRODUCT_BY_ID(id)}`;

    return from(fetch(url)).pipe(
      switchMap(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = (await response.json()) as ProductResponse;
        return data.product;
      }),
      catchError((error) => {
        console.error('Error fetching product:', error);
        return throwError(error);
      }),
    );
  }

  searchProducts(query: string): Observable<Product[]> {
    return this.getProducts({ q: query, limit: 10 });
  }

  // Regions
  getRegions(): Observable<Region[]> {
    const url = `${API_BASE_URL}${ENDPOINTS.REGIONS}`;

    return from(fetch(url)).pipe(
      switchMap(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = (await response.json()) as RegionsResponse;
        return data.regions;
      }),
      catchError((error) => {
        console.error('Error fetching regions:', error);
        return throwError(error);
      }),
    );
  }

  // Cart operations
  createCart(regionId?: string): Observable<Cart> {
    const url = `${API_BASE_URL}${ENDPOINTS.CART}`;
    const region = regionId || this.currentRegion$.value?.id || DEFAULT_REGION;

    return from(
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ region_id: region }),
      }),
    ).pipe(
      switchMap(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = (await response.json()) as CartResponse;
        return data.cart;
      }),
      catchError((error) => {
        console.error('Error creating cart:', error);
        return throwError(error);
      }),
    );
  }

  getCart(cartId: string): Observable<Cart> {
    const url = `${API_BASE_URL}${ENDPOINTS.CART_BY_ID(cartId)}`;

    return from(fetch(url)).pipe(
      switchMap(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = (await response.json()) as CartResponse;
        return data.cart;
      }),
      catchError((error) => {
        console.error('Error fetching cart:', error);
        return throwError(error);
      }),
    );
  }

  addToCart(cartId: string, variantId: string, quantity: number = 1): Observable<Cart> {
    const url = `${API_BASE_URL}${ENDPOINTS.ADD_TO_CART(cartId)}`;

    return from(
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          variant_id: variantId,
          quantity: quantity,
        }),
      }),
    ).pipe(
      switchMap(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = (await response.json()) as CartResponse;
        return data.cart;
      }),
      catchError((error) => {
        console.error('Error adding to cart:', error);
        return throwError(error);
      }),
    );
  }

  updateCartItem(cartId: string, itemId: string, quantity: number): Observable<Cart> {
    const url = `${API_BASE_URL}${ENDPOINTS.UPDATE_CART_ITEM(cartId, itemId)}`;

    return from(
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity }),
      }),
    ).pipe(
      switchMap(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = (await response.json()) as CartResponse;
        return data.cart;
      }),
      catchError((error) => {
        console.error('Error updating cart item:', error);
        return throwError(error);
      }),
    );
  }

  removeFromCart(cartId: string, itemId: string): Observable<Cart> {
    const url = `${API_BASE_URL}${ENDPOINTS.REMOVE_FROM_CART(cartId, itemId)}`;

    return from(
      fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    ).pipe(
      switchMap(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = (await response.json()) as CartResponse;
        return data.cart;
      }),
      catchError((error) => {
        console.error('Error removing from cart:', error);
        return throwError(error);
      }),
    );
  }

  // Utility methods
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    return response.json() as Promise<T>;
  }

  private buildQueryString(params: Record<string, any>): string {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((item) => queryParams.append(key, item.toString()));
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });

    return queryParams.toString();
  }
}
