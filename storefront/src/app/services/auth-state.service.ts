import { httpResource, HttpResourceRequest } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import {
  Customer,
  LoginCredentials,
  RegisterData,
  STORAGE_KEYS,
} from '../../../../shared/src/types';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthStateService {
  private readonly authService = inject(AuthService);

  // Auth token signal - the source of truth
  private readonly authToken = signal<string | null>(this.getStoredToken());

  // Customer ID derived from token (you might decode JWT or get from API)
  private readonly customerId = computed(() => {
    const token = this.authToken();
    return token ? this.extractCustomerIdFromToken(token) : null;
  });

  // Signals for triggering auth mutations
  private readonly loginTrigger = signal<LoginCredentials | null>(null);
  private readonly registerTrigger = signal<RegisterData | null>(null);
  private readonly logoutTrigger = signal<boolean>(false);
  private readonly refreshTokenTrigger = signal<boolean>(false);

  // HTTP Resource for fetching current customer data
  private readonly customerResource = httpResource<Customer>(
    () => {
      const token = this.authToken();
      const id = this.customerId();

      if (!token || !id) return undefined;

      return {
        url: `/api/customer/${id}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      } as HttpResourceRequest;
    },
    {
      parse: (data) => {
        // Validate and transform customer data if needed
        return data as Customer;
      },
    },
  );

  // HTTP Resources for auth mutations
  private readonly loginResource = httpResource<{ customer: Customer; token: string }>(() => {
    const credentials = this.loginTrigger();

    if (!credentials) return undefined;

    return {
      url: '/api/auth/login',
      method: 'POST',
      body: credentials,
    } as HttpResourceRequest;
  });

  private readonly registerResource = httpResource<{ customer: Customer; token: string }>(() => {
    const data = this.registerTrigger();

    if (!data) return undefined;

    return {
      url: '/api/auth/register',
      method: 'POST',
      body: data,
    } as HttpResourceRequest;
  });

  private readonly logoutResource = httpResource<{ success: boolean }>(() => {
    const shouldLogout = this.logoutTrigger();
    const token = this.authToken();

    if (!shouldLogout || !token) return undefined;

    return {
      url: '/api/auth/logout',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    } as HttpResourceRequest;
  });

  private readonly refreshTokenResource = httpResource<{ token: string }>(() => {
    const shouldRefresh = this.refreshTokenTrigger();
    const token = this.authToken();

    if (!shouldRefresh || !token) return undefined;

    return {
      url: '/api/auth/refresh',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    } as HttpResourceRequest;
  });

  // Public readonly computed signals
  readonly customer = computed(() => this.customerResource.value() ?? null);
  readonly isAuthenticated = computed(() => !!this.authToken());
  readonly token = this.authToken.asReadonly();

  // Loading states
  readonly isLoadingCustomer = computed(() => this.customerResource.isLoading());
  readonly isLoggingIn = computed(() => this.loginResource.isLoading());
  readonly isRegistering = computed(() => this.registerResource.isLoading());
  readonly isLoggingOut = computed(() => this.logoutResource.isLoading());
  readonly isRefreshingToken = computed(() => this.refreshTokenResource.isLoading());

  // Error states
  readonly customerError = computed(() => this.customerResource.error());
  readonly loginError = computed(() => this.loginResource.error());
  readonly registerError = computed(() => this.registerResource.error());
  readonly logoutError = computed(() => this.logoutResource.error());
  readonly refreshTokenError = computed(() => this.refreshTokenResource.error());

  constructor() {
    // Effect to sync token changes to localStorage (only when needed)
    effect(() => {
      const token = this.authToken();
      const storedToken = this.getStoredToken();

      if (token !== storedToken) {
        if (token) {
          localStorage.setItem(STORAGE_KEYS.CUSTOMER_TOKEN, token);
        } else {
          localStorage.removeItem(STORAGE_KEYS.CUSTOMER_TOKEN);
        }
      }
    });

    // Effect to handle login success
    effect(() => {
      const loginResult = this.loginResource.value();
      if (loginResult) {
        this.authToken.set(loginResult.token);
        this.loginTrigger.set(null);
        // customerResource will automatically load due to token change
      }
    });

    // Effect to handle register success
    effect(() => {
      const registerResult = this.registerResource.value();
      if (registerResult) {
        this.authToken.set(registerResult.token);
        this.registerTrigger.set(null);
        // customerResource will automatically load due to token change
      }
    });

    // Effect to handle logout success
    effect(() => {
      const logoutResult = this.logoutResource.value();
      if (logoutResult?.success) {
        this.authToken.set(null);
        this.logoutTrigger.set(false);
        // customerResource will automatically clear due to token removal
      }
    });

    // Effect to handle token refresh success
    effect(() => {
      const refreshResult = this.refreshTokenResource.value();
      if (refreshResult) {
        this.authToken.set(refreshResult.token);
        this.refreshTokenTrigger.set(false);
        // customerResource will automatically reload with new token
      }
    });

    // Effects to handle mutation errors
    effect(() => {
      const error = this.loginResource.error();
      if (error) {
        console.error('Login error:', error);
        this.loginTrigger.set(null);
      }
    });

    effect(() => {
      const error = this.registerResource.error();
      if (error) {
        console.error('Register error:', error);
        this.registerTrigger.set(null);
      }
    });

    effect(() => {
      const error = this.logoutResource.error();
      if (error) {
        console.error('Logout error:', error);
        this.logoutTrigger.set(false);
        // Even on error, we might want to clear local token
        this.authToken.set(null);
      }
    });

    effect(() => {
      const error = this.refreshTokenResource.error();
      if (error) {
        console.error('Token refresh error:', error);
        this.refreshTokenTrigger.set(false);
        // On refresh error, logout user
        this.authToken.set(null);
      }
    });

    effect(() => {
      const error = this.customerResource.error();
      if (error) {
        console.error('Customer loading error:', error);
        // If customer can't be loaded (e.g., token expired), clear auth
        //TODO
        // if (error.status === 401) {
        //   this.authToken.set(null);
        // }
      }
    });
  }

  // Public methods for auth operations (subscription-free)
  login(credentials: LoginCredentials): void {
    this.loginTrigger.set(credentials);
  }

  register(data: RegisterData): void {
    this.registerTrigger.set(data);
  }

  logout(): void {
    this.logoutTrigger.set(true);
  }

  refreshToken(): void {
    this.refreshTokenTrigger.set(true);
  }

  // Force refresh customer data
  refreshCustomer(): void {
    this.customerResource.reload();
  }

  // Check if token is expired (implement based on your token structure)
  isTokenExpired(): boolean {
    const token = this.authToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }

  // Auto-refresh token if needed
  checkAndRefreshToken(): void {
    if (this.isAuthenticated() && this.isTokenExpired()) {
      this.refreshToken();
    }
  }

  // Get stored token from localStorage
  private getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEYS.CUSTOMER_TOKEN);
  }

  // Extract customer ID from JWT token (implement based on your token structure)
  private extractCustomerIdFromToken(token: string): string | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || payload.customerId || payload.customer_id || payload.id || null;
    } catch {
      return null;
    }
  }
}
