import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  Cart,
  CartResponse,
  DEFAULT_REGION,
  ENDPOINTS,
  Region,
  RegionsResponse,
} from '../../../../shared/src/types';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class MedusaApiService {
  private readonly http = inject(HttpClient);
  private readonly configService = inject(ConfigService);

  private readonly currentRegion$ = new BehaviorSubject<Region | null>(null);

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
