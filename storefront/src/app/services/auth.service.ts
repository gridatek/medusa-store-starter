// Authentication Service
// storefront/src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import {
  Customer,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  API_BASE_URL,
  ENDPOINTS,
  STORAGE_KEYS,
} from '../../../../shared/src/types';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentCustomer$ = new BehaviorSubject<Customer | null>(null);
  private isAuthenticated$ = new BehaviorSubject<boolean>(false);

  constructor() {
    this.checkAuthState();
  }

  private async checkAuthState(): Promise<void> {
    const token = this.getTokenFromStorage();
    if (token) {
      try {
        const customer = await this.getCurrentCustomer().toPromise();
        if (customer) {
          this.currentCustomer$.next(customer);
          this.isAuthenticated$.next(true);
        }
      } catch (error) {
        this.clearAuthState();
      }
    }
  }

  login(credentials: LoginCredentials): Observable<Customer> {
    const url = `${API_BASE_URL}${ENDPOINTS.AUTH.LOGIN}`;

    return from(
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      }),
    ).pipe(
      map(async (response) => {
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Login failed');
        }
        const data = (await response.json()) as AuthResponse;
        return data;
      }),
      tap((authData) => {
        this.currentCustomer$.next(authData.customer);
        this.isAuthenticated$.next(true);
        if (authData.access_token) {
          this.saveTokenToStorage(authData.access_token);
        }
      }),
      map((authData) => authData.customer),
      catchError((error) => {
        console.error('Login error:', error);
        return throwError(error);
      }),
    );
  }

  register(registerData: RegisterData): Observable<Customer> {
    const url = `${API_BASE_URL}${ENDPOINTS.CUSTOMERS}`;

    return from(
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      }),
    ).pipe(
      map(async (response) => {
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Registration failed');
        }
        const data = await response.json();
        return data.customer;
      }),
      catchError((error) => {
        console.error('Registration error:', error);
        return throwError(error);
      }),
    );
  }

  logout(): Observable<void> {
    const url = `${API_BASE_URL}${ENDPOINTS.AUTH.LOGOUT}`;
    const token = this.getTokenFromStorage();

    return from(
      fetch(url, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }),
    ).pipe(
      tap(() => this.clearAuthState()),
      map(() => void 0),
      catchError((error) => {
        this.clearAuthState();
        return throwError(error);
      }),
    );
  }

  getCurrentCustomer(): Observable<Customer> {
    const url = `${API_BASE_URL}${ENDPOINTS.AUTH.CUSTOMER}`;
    const token = this.getTokenFromStorage();

    if (!token) {
      return throwError(new Error('No authentication token'));
    }

    return from(
      fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }),
    ).pipe(
      map(async (response) => {
        if (!response.ok) {
          throw new Error('Failed to get customer data');
        }
        const data = await response.json();
        return data.customer;
      }),
      catchError((error) => {
        console.error('Get customer error:', error);
        return throwError(error);
      }),
    );
  }

  getCustomer(): Observable<Customer | null> {
    return this.currentCustomer$.asObservable();
  }

  isLoggedIn(): Observable<boolean> {
    return this.isAuthenticated$.asObservable();
  }

  private clearAuthState(): void {
    this.currentCustomer$.next(null);
    this.isAuthenticated$.next(false);
    this.removeTokenFromStorage();
  }

  private getTokenFromStorage(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.CUSTOMER_TOKEN);
    }
    return null;
  }

  private saveTokenToStorage(token: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.CUSTOMER_TOKEN, token);
    }
  }

  private removeTokenFromStorage(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.CUSTOMER_TOKEN);
    }
  }
}
