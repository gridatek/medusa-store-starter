import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';

export interface Product {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  variants: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  title: string;
  prices: ProductPrice[];
}

export interface ProductPrice {
  amount: number;
  currency_code: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProductSearchService {
  private readonly baseUrl = 'http://localhost:9000';
  private searchResults$ = new BehaviorSubject<Product[]>([]);
  private loading$ = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {}

  searchProducts(query: string): Observable<Product[]> {
    if (!query.trim()) {
      this.searchResults$.next([]);
      return of([]);
    }

    this.loading$.next(true);

    return this.http
      .get<{ products: Product[] }>(`${this.baseUrl}/store/products?q=${encodeURIComponent(query)}`)
      .pipe(
        switchMap((response) => {
          this.loading$.next(false);
          this.searchResults$.next(response.products);
          return of(response.products);
        }),
        catchError((error) => {
          this.loading$.next(false);
          console.error('Search error:', error);
          this.searchResults$.next([]);
          return of([]);
        }),
      );
  }

  getSearchResults(): Observable<Product[]> {
    return this.searchResults$.asObservable();
  }

  isLoading(): Observable<boolean> {
    return this.loading$.asObservable();
  }

  clearResults(): void {
    this.searchResults$.next([]);
  }
}
