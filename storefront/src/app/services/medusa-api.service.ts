import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ConfigService } from './config.service';
import {
  Product,
  ProductsResponse,
  ProductResponse,
  Cart,
  CartResponse,
  Region,
  RegionsResponse,
  ENDPOINTS,
  DEFAULT_REGION,
} from '../../../../shared/src/types';

@Injectable({
  providedIn: 'root',
})
export class MedusaApiService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);

  private currentRegion$ = new BehaviorSubject<Region | null>(null);

  private get apiBaseUrl(): string {
    return this.configService.medusaApiUrl;
  }

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
    let httpParams = new HttpParams();

    if (params?.offset) httpParams = httpParams.set('offset', params.offset.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.q) httpParams = httpParams.set('q', params.q);
    if (params?.collection_id) {
      params.collection_id.forEach((id) => {
        httpParams = httpParams.append('collection_id', id);
      });
    }
    if (params?.type_id) {
      params.type_id.forEach((id) => {
        httpParams = httpParams.append('type_id', id);
      });
    }
    if (params?.tags) {
      params.tags.forEach((tag) => {
        httpParams = httpParams.append('tags', tag);
      });
    }
    if (params?.region_id) httpParams = httpParams.set('region_id', params.region_id);

    const url = `${this.apiBaseUrl}${ENDPOINTS.PRODUCTS}`;

    return this.http.get<ProductsResponse>(url, { params: httpParams }).pipe(
      map((response) => response.products),
      catchError((error) => {
        console.error('Error fetching products:', error);
        return throwError(error);
      }),
    );
  }

  getProduct(id: string): Observable<Product> {
    const url = `${this.apiBaseUrl}${ENDPOINTS.PRODUCT_BY_ID(id)}`;

    return this.http.get<ProductResponse>(url).pipe(
      map((response) => response.product),
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
    const url = `${this.apiBaseUrl}${ENDPOINTS.REGIONS}`;

    return this.http.get<RegionsResponse>(url).pipe(
      map((response) => response.regions),
      catchError((error) => {
        console.error('Error fetching regions:', error);
        return throwError(error);
      }),
    );
  }

  // Cart operations
  createCart(regionId?: string): Observable<Cart> {
    const url = `${this.apiBaseUrl}${ENDPOINTS.CART}`;
    const region = regionId || this.currentRegion$.value?.id || DEFAULT_REGION;

    return this.http.post<CartResponse>(url, { region_id: region }).pipe(
      map((response) => response.cart),
      catchError((error) => {
        console.error('Error creating cart:', error);
        return throwError(error);
      }),
    );
  }

  getCart(cartId: string): Observable<Cart> {
    const url = `${this.apiBaseUrl}${ENDPOINTS.CART_BY_ID(cartId)}`;

    return this.http.get<CartResponse>(url).pipe(
      map((response) => response.cart),
      catchError((error) => {
        console.error('Error fetching cart:', error);
        return throwError(error);
      }),
    );
  }

  addToCart(cartId: string, variantId: string, quantity: number = 1): Observable<Cart> {
    const url = `${this.apiBaseUrl}${ENDPOINTS.ADD_TO_CART(cartId)}`;

    return this.http
      .post<CartResponse>(url, {
        variant_id: variantId,
        quantity: quantity,
      })
      .pipe(
        map((response) => response.cart),
        catchError((error) => {
          console.error('Error adding to cart:', error);
          return throwError(error);
        }),
      );
  }

  updateCartItem(cartId: string, itemId: string, quantity: number): Observable<Cart> {
    const url = `${this.apiBaseUrl}${ENDPOINTS.UPDATE_CART_ITEM(cartId, itemId)}`;

    return this.http.post<CartResponse>(url, { quantity }).pipe(
      map((response) => response.cart),
      catchError((error) => {
        console.error('Error updating cart item:', error);
        return throwError(error);
      }),
    );
  }

  removeFromCart(cartId: string, itemId: string): Observable<Cart> {
    const url = `${this.apiBaseUrl}${ENDPOINTS.REMOVE_FROM_CART(cartId, itemId)}`;

    return this.http.delete<CartResponse>(url).pipe(
      map((response) => response.cart),
      catchError((error) => {
        console.error('Error removing from cart:', error);
        return throwError(error);
      }),
    );
  }
}
