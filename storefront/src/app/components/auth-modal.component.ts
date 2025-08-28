// Auth Modal Component
// storefront/src/app/components/auth-modal.component.ts
import { Component, Output, EventEmitter, input } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { LoginCredentials, RegisterData } from '../../../../shared/src/types';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [FormsModule],
  template: `
    @if (isOpen()) {
      <div
        data-testid="auth-modal"
        class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
        (click)="closeModal($event)"
      >
        <div
          class="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          (click)="$event.stopPropagation()"
        >
          <!-- Header -->
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-900">
              {{ isLoginMode ? 'Sign In' : 'Create Account' }}
            </h2>
            <button
              data-testid="close-modal"
              class="text-gray-400 hover:text-gray-600"
              (click)="closeModal()"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>
          <!-- Tab Navigation -->
          <div class="flex mb-6 border-b border-gray-200">
            <button
              data-testid="login-tab"
              class="flex-1 py-2 px-4 text-center font-medium border-b-2 transition-colors"
              [class.border-blue-500]="isLoginMode"
              [class.text-blue-600]="isLoginMode"
              [class.border-transparent]="!isLoginMode"
              [class.text-gray-500]="!isLoginMode"
              (click)="switchToLogin()"
            >
              Sign In
            </button>
            <button
              data-testid="register-tab"
              class="flex-1 py-2 px-4 text-center font-medium border-b-2 transition-colors"
              [class.border-blue-500]="!isLoginMode"
              [class.text-blue-600]="!isLoginMode"
              [class.border-transparent]="isLoginMode"
              [class.text-gray-500]="isLoginMode"
              (click)="switchToRegister()"
            >
              Sign Up
            </button>
          </div>
          <!-- Error Message -->
          @if (errorMessage) {
            <div
              data-testid="auth-error"
              class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md"
            >
              <p class="text-red-600 text-sm">{{ errorMessage }}</p>
            </div>
          }
          <!-- Login Form -->
          @if (isLoginMode) {
            <form data-testid="login-form" (ngSubmit)="onLogin()" #loginForm="ngForm">
              <div class="space-y-4">
                <div>
                  <label for="email-login" class="block text-sm font-medium text-gray-700 mb-1"
                    >Email</label
                  >
                  <input
                    data-testid="email-login-input"
                    type="email"
                    id="email-login"
                    name="email"
                    [(ngModel)]="loginData.email"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label for="password-login" class="block text-sm font-medium text-gray-700 mb-1"
                    >Password</label
                  >
                  <input
                    data-testid="password-login-input"
                    type="password"
                    id="password-login"
                    name="password"
                    [(ngModel)]="loginData.password"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your password"
                  />
                </div>
              </div>
              <button
                data-testid="login-submit"
                type="submit"
                class="w-full mt-6 bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300"
                [disabled]="isLoading || loginForm.invalid"
              >
                @if (!isLoading) {
                  <span>Sign In</span>
                }
                @if (isLoading) {
                  <span class="flex items-center justify-center">
                    <div
                      class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"
                    ></div>
                    Signing In...
                  </span>
                }
              </button>
              <div class="mt-4 text-center">
                <a href="#" class="text-blue-600 hover:text-blue-800 text-sm"
                  >Forgot your password?</a
                >
              </div>
            </form>
          }
          <!-- Register Form -->
          @if (!isLoginMode) {
            <form data-testid="register-form" (ngSubmit)="onRegister()" #registerForm="ngForm">
              <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label for="first-name" class="block text-sm font-medium text-gray-700 mb-1"
                      >First Name</label
                    >
                    <input
                      data-testid="first-name-register-input"
                      type="text"
                      id="first-name"
                      name="firstName"
                      [(ngModel)]="registerData.first_name"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <label for="last-name" class="block text-sm font-medium text-gray-700 mb-1"
                      >Last Name</label
                    >
                    <input
                      data-testid="last-name-register-input"
                      type="text"
                      id="last-name"
                      name="lastName"
                      [(ngModel)]="registerData.last_name"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Last name"
                    />
                  </div>
                </div>
                <div>
                  <label for="email-register" class="block text-sm font-medium text-gray-700 mb-1"
                    >Email</label
                  >
                  <input
                    data-testid="email-register-input"
                    type="email"
                    id="email-register"
                    name="email"
                    [(ngModel)]="registerData.email"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label
                    for="password-register"
                    class="block text-sm font-medium text-gray-700 mb-1"
                    >Password</label
                  >
                  <input
                    data-testid="password-register-input"
                    type="password"
                    id="password-register"
                    name="password"
                    [(ngModel)]="registerData.password"
                    required
                    minlength="8"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Create a password"
                  />
                </div>
                <div>
                  <label for="phone" class="block text-sm font-medium text-gray-700 mb-1"
                    >Phone (Optional)</label
                  >
                  <input
                    data-testid="phone-register-input"
                    type="tel"
                    id="phone"
                    name="phone"
                    [(ngModel)]="registerData.phone"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Phone number"
                  />
                </div>
              </div>
              <button
                data-testid="register-submit"
                type="submit"
                class="w-full mt-6 bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300"
                [disabled]="isLoading || registerForm.invalid"
              >
                @if (!isLoading) {
                  <span>Create Account</span>
                }
                @if (isLoading) {
                  <span class="flex items-center justify-center">
                    <div
                      class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"
                    ></div>
                    Creating Account...
                  </span>
                }
              </button>
              <div class="mt-4 text-center text-sm text-gray-600">
                By creating an account, you agree to our
                <a href="#" class="text-blue-600 hover:text-blue-800">Terms of Service</a> and
                <a href="#" class="text-blue-600 hover:text-blue-800">Privacy Policy</a>
              </div>
            </form>
          }
        </div>
      </div>
    }
  `,
})
export class AuthModalComponent {
  readonly isOpen = input(false);
  @Output() closeEvent = new EventEmitter<void>();
  @Output() authSuccess = new EventEmitter<void>();

  isLoginMode = true;
  isLoading = false;
  errorMessage = '';

  loginData: LoginCredentials = {
    email: '',
    password: '',
  };

  registerData: RegisterData = {
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
  };

  constructor(private authService: AuthService) {}

  closeModal(event?: Event): void {
    if (event && event.target === event.currentTarget) {
      this.closeEvent.emit();
    } else if (!event) {
      this.closeEvent.emit();
    }
  }

  switchToLogin(): void {
    this.isLoginMode = true;
    this.errorMessage = '';
  }

  switchToRegister(): void {
    this.isLoginMode = false;
    this.errorMessage = '';
  }

  async onLogin(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      await this.authService.login(this.loginData).toPromise();
      this.authSuccess.emit();
      this.closeEvent.emit();
    } catch (error: any) {
      this.errorMessage = error.message || 'Login failed. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  async onRegister(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      await this.authService.register(this.registerData).toPromise();
      // After successful registration, automatically log in
      await this.authService
        .login({
          email: this.registerData.email,
          password: this.registerData.password,
        })
        .toPromise();

      this.authSuccess.emit();
      this.closeEvent.emit();
    } catch (error: any) {
      this.errorMessage = error.message || 'Registration failed. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }
}
