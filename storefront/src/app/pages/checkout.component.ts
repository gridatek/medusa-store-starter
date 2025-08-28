import { Component, OnInit, OnDestroy, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartService } from '../services/cart.service';
import { AuthService } from '../services/auth.service';
import { MedusaApiService } from '../services/medusa-api.service';
import { Cart, Customer, Address, formatPrice } from '../../../../shared/src/types';

interface CheckoutStep {
  id: string;
  title: string;
  completed: boolean;
  current: boolean;
}

interface ShippingOption {
  id: string;
  name: string;
  price: number;
  description?: string;
  estimated_delivery?: string;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Checkout Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
        <div class="flex items-center space-x-4">
          <a href="/cart" class="text-blue-600 hover:text-blue-800 text-sm">← Back to Cart</a>
        </div>
      </div>

      <!-- Progress Steps -->
      <div class="mb-8">
        <nav class="flex justify-center">
          <ol class="flex items-center space-x-4 md:space-x-8">
            @for (step of steps; track step; let i = $index) {
              <li class="flex items-center">
                <div class="flex items-center">
                  <div
                    class="flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium"
                    [class.bg-blue-600]="step.completed || step.current"
                    [class.text-white]="step.completed || step.current"
                    [class.border-blue-600]="step.completed || step.current"
                    [class.border-gray-300]="!step.completed && !step.current"
                    [class.text-gray-500]="!step.completed && !step.current"
                  >
                    @if (step.completed && !step.current) {
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fill-rule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clip-rule="evenodd"
                        ></path>
                      </svg>
                    }
                    @if (!step.completed || step.current) {
                      <span>{{ i + 1 }}</span>
                    }
                  </div>
                  <span
                    class="ml-2 text-sm font-medium"
                    [class.text-gray-500]="!step.completed && !step.current"
                  >
                    {{ step.title }}
                  </span>
                </div>
                @if (i < steps.length - 1) {
                  <svg class="w-5 h-5 text-gray-300 ml-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                }
              </li>
            }
          </ol>
        </nav>
      </div>

      <div class="lg:grid lg:grid-cols-12 lg:gap-x-12">
        <!-- Main Checkout Form -->
        <div class="lg:col-span-7">
          <div data-testid="checkout-form" class="space-y-8">
            <!-- Step 1: Contact Information -->
            @if (currentStep === 'contact') {
              <div class="bg-white rounded-lg shadow p-6">
                <h2 class="text-lg font-medium text-gray-900 mb-4">Contact Information</h2>
                <!-- Guest/Login Options -->
                @if (!currentCustomer) {
                  <div class="mb-6">
                    <div class="flex items-center justify-between mb-4">
                      <div class="flex items-center">
                        <input
                          type="radio"
                          id="guest-checkout"
                          name="checkout-type"
                          value="guest"
                          [(ngModel)]="checkoutType"
                          class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                        />
                        <label for="guest-checkout" class="ml-2 text-sm text-gray-900"
                          >Guest Checkout</label
                        >
                      </div>
                      <div class="flex items-center">
                        <input
                          type="radio"
                          id="returning-customer"
                          name="checkout-type"
                          value="login"
                          [(ngModel)]="checkoutType"
                          class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                        />
                        <label for="returning-customer" class="ml-2 text-sm text-gray-900"
                          >Returning Customer</label
                        >
                      </div>
                    </div>
                  </div>
                }
                <!-- Login Form for Returning Customers -->
                @if (checkoutType === 'login' && !currentCustomer) {
                  <div class="mb-6 p-4 bg-gray-50 rounded-lg">
                    <form (ngSubmit)="loginCustomer()">
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <input
                            type="email"
                            [(ngModel)]="loginData.email"
                            name="loginEmail"
                            required
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1"
                            >Password</label
                          >
                          <input
                            type="password"
                            [(ngModel)]="loginData.password"
                            name="loginPassword"
                            required
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        class="mt-3 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
                      >
                        Sign In
                      </button>
                    </form>
                  </div>
                }
                <!-- Contact Form -->
                <form (ngSubmit)="proceedToShipping()">
                  <div class="mb-4">
                    <label for="email" class="block text-sm font-medium text-gray-700 mb-1"
                      >Email Address</label
                    >
                    <input
                      data-testid="email-input"
                      type="email"
                      id="email"
                      name="email"
                      [(ngModel)]="contactInfo.email"
                      required
                      [disabled]="!!currentCustomer"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      placeholder="Enter your email address"
                    />
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label for="firstName" class="block text-sm font-medium text-gray-700 mb-1"
                        >First Name</label
                      >
                      <input
                        data-testid="first-name-input"
                        type="text"
                        id="firstName"
                        name="firstName"
                        [(ngModel)]="contactInfo.first_name"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="First name"
                      />
                    </div>
                    <div>
                      <label for="lastName" class="block text-sm font-medium text-gray-700 mb-1"
                        >Last Name</label
                      >
                      <input
                        data-testid="last-name-input"
                        type="text"
                        id="lastName"
                        name="lastName"
                        [(ngModel)]="contactInfo.last_name"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Last name"
                      />
                    </div>
                  </div>
                  <button
                    data-testid="continue-to-shipping"
                    type="submit"
                    class="mt-6 w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    [disabled]="isProcessing"
                  >
                    Continue to Shipping
                  </button>
                </form>
              </div>
            }

            <!-- Step 2: Shipping Address -->
            @if (currentStep === 'shipping') {
              <div class="bg-white rounded-lg shadow p-6">
                <h2 class="text-lg font-medium text-gray-900 mb-4">Shipping Address</h2>
                <form (ngSubmit)="proceedToPayment()">
                  <div class="space-y-4">
                    <div>
                      <label for="address1" class="block text-sm font-medium text-gray-700 mb-1"
                        >Address</label
                      >
                      <input
                        data-testid="address-input"
                        type="text"
                        id="address1"
                        name="address1"
                        [(ngModel)]="shippingAddress.address_1"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Street address"
                      />
                    </div>
                    <div>
                      <label for="address2" class="block text-sm font-medium text-gray-700 mb-1"
                        >Apartment, suite, etc. (optional)</label
                      >
                      <input
                        type="text"
                        id="address2"
                        name="address2"
                        [(ngModel)]="shippingAddress.address_2"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Apartment, suite, etc."
                      />
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label for="city" class="block text-sm font-medium text-gray-700 mb-1"
                          >City</label
                        >
                        <input
                          data-testid="city-input"
                          type="text"
                          id="city"
                          name="city"
                          [(ngModel)]="shippingAddress.city"
                          required
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <label for="province" class="block text-sm font-medium text-gray-700 mb-1"
                          >State/Province</label
                        >
                        <input
                          type="text"
                          id="province"
                          name="province"
                          [(ngModel)]="shippingAddress.province"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="State/Province"
                        />
                      </div>
                      <div>
                        <label for="postalCode" class="block text-sm font-medium text-gray-700 mb-1"
                          >Postal Code</label
                        >
                        <input
                          data-testid="postal-code-input"
                          type="text"
                          id="postalCode"
                          name="postalCode"
                          [(ngModel)]="shippingAddress.postal_code"
                          required
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Postal code"
                        />
                      </div>
                    </div>
                    <div>
                      <label for="country" class="block text-sm font-medium text-gray-700 mb-1"
                        >Country</label
                      >
                      <select
                        id="country"
                        name="country"
                        [(ngModel)]="shippingAddress.country_code"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Country</option>
                        <option value="us">United States</option>
                        <option value="ca">Canada</option>
                        <option value="gb">United Kingdom</option>
                        <option value="de">Germany</option>
                        <option value="fr">France</option>
                      </select>
                    </div>
                    <div>
                      <label for="phone" class="block text-sm font-medium text-gray-700 mb-1"
                        >Phone (optional)</label
                      >
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        [(ngModel)]="shippingAddress.phone"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Phone number"
                      />
                    </div>
                  </div>
                  <!-- Shipping Options -->
                  @if (shippingOptions.length > 0) {
                    <div data-testid="shipping-options" class="mt-6">
                      <h3 class="text-lg font-medium text-gray-900 mb-4">Shipping Method</h3>
                      <div class="space-y-3">
                        @for (option of shippingOptions; track option) {
                          <div
                            data-testid="shipping-option"
                            class="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300"
                            [class.border-blue-500]="selectedShippingOption === option.id"
                            [class.bg-blue-50]="selectedShippingOption === option.id"
                            (click)="selectShippingOption(option.id)"
                          >
                            <div class="flex items-center">
                              <input
                                type="radio"
                                [id]="'shipping-' + option.id"
                                name="shippingOption"
                                [value]="option.id"
                                [(ngModel)]="selectedShippingOption"
                                class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                              />
                              <div class="ml-3">
                                <label
                                  [for]="'shipping-' + option.id"
                                  class="text-sm font-medium text-gray-900 cursor-pointer"
                                >
                                  {{ option.name }}
                                </label>
                                @if (option.description) {
                                  <p class="text-sm text-gray-500">
                                    {{ option.description }}
                                  </p>
                                }
                                @if (option.estimated_delivery) {
                                  <p class="text-xs text-gray-400">
                                    {{ option.estimated_delivery }}
                                  </p>
                                }
                              </div>
                            </div>
                            <span class="text-sm font-medium text-gray-900">
                              {{ formatPrice(option.price) }}
                            </span>
                          </div>
                        }
                      </div>
                    </div>
                  }
                  <div class="flex space-x-4 mt-6">
                    <button
                      type="button"
                      class="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                      (click)="backToContact()"
                    >
                      Back to Contact
                    </button>
                    <button
                      type="submit"
                      class="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      [disabled]="isProcessing || !selectedShippingOption"
                    >
                      Continue to Payment
                    </button>
                  </div>
                </form>
              </div>
            }

            <!-- Step 3: Payment -->
            @if (currentStep === 'payment') {
              <div class="bg-white rounded-lg shadow p-6">
                <h2 class="text-lg font-medium text-gray-900 mb-4">Payment Information</h2>
                <div class="mb-6">
                  <h3 class="text-sm font-medium text-gray-900 mb-3">Payment Method</h3>
                  <div class="space-y-3">
                    <div class="flex items-center p-3 border border-gray-200 rounded-lg">
                      <input
                        type="radio"
                        id="card-payment"
                        name="paymentMethod"
                        value="card"
                        [(ngModel)]="selectedPaymentMethod"
                        class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                      />
                      <label for="card-payment" class="ml-3 text-sm font-medium text-gray-900"
                        >Credit/Debit Card</label
                      >
                    </div>
                  </div>
                </div>
                <!-- Card Form -->
                @if (selectedPaymentMethod === 'card') {
                  <div>
                    <div class="space-y-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1"
                          >Card Number</label
                        >
                        <input
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div class="grid grid-cols-2 gap-4">
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1"
                            >Expiry Date</label
                          >
                          <input
                            type="text"
                            placeholder="MM/YY"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                          <input
                            type="text"
                            placeholder="123"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1"
                          >Cardholder Name</label
                        >
                        <input
                          type="text"
                          placeholder="Full name on card"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                }
                <div class="flex space-x-4 mt-6">
                  <button
                    type="button"
                    class="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                    (click)="backToShipping()"
                  >
                    Back to Shipping
                  </button>
                  <button
                    type="button"
                    class="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
                    [disabled]="isProcessing"
                    (click)="completeOrder()"
                  >
                    @if (!isProcessing) {
                      <span>Complete Order</span>
                    }
                    @if (isProcessing) {
                      <span class="flex items-center justify-center">
                        <div
                          class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"
                        ></div>
                        Processing...
                      </span>
                    }
                  </button>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Order Summary -->
        <div class="lg:col-span-5 mt-10 lg:mt-0">
          <div class="bg-gray-50 rounded-lg p-6 sticky top-24">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>

            <!-- Cart Items -->
            <div class="space-y-4 mb-6">
              @for (item of cart?.items; track item) {
                <div class="flex items-center space-x-3">
                  <img
                    [src]="item.thumbnail || '/assets/placeholder-product.png'"
                    [alt]="item.title"
                    class="w-16 h-16 object-cover rounded-md"
                  />
                  <div class="flex-1">
                    <h3 class="text-sm font-medium text-gray-900">{{ item.title }}</h3>
                    <p class="text-sm text-gray-500">Qty: {{ item.quantity }}</p>
                  </div>
                  <span class="text-sm font-medium text-gray-900">
                    {{ formatPrice(item.unit_price * item.quantity) }}
                  </span>
                </div>
              }
            </div>

            <!-- Totals -->
            <div class="space-y-2 border-t border-gray-200 pt-4">
              <div class="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{{ formatPrice(cart?.subtotal || 0) }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span>Shipping</span>
                <span>{{ getShippingCost() }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span>Tax</span>
                <span>{{ formatPrice(cart?.tax_total || 0) }}</span>
              </div>
              <div class="flex justify-between text-lg font-semibold border-t border-gray-200 pt-2">
                <span>Total</span>
                <span>{{ formatPrice(getTotalWithShipping()) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class CheckoutComponent implements OnInit, OnDestroy {
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private medusaApi = inject(MedusaApiService);
  private router = inject(Router);

  cart: Cart | null = null;
  currentCustomer: Customer | null = null;
  currentStep = 'contact';
  checkoutType = 'guest';
  isProcessing = false;

  steps: CheckoutStep[] = [
    { id: 'contact', title: 'Contact', completed: false, current: true },
    { id: 'shipping', title: 'Shipping', completed: false, current: false },
    { id: 'payment', title: 'Payment', completed: false, current: false },
  ];

  contactInfo = {
    email: '',
    first_name: '',
    last_name: '',
  };

  loginData = {
    email: '',
    password: '',
  };

  shippingAddress: Partial<Address> = {
    first_name: '',
    last_name: '',
    address_1: '',
    address_2: '',
    city: '',
    province: '',
    postal_code: '',
    country_code: '',
    phone: '',
  };

  shippingOptions: ShippingOption[] = [
    {
      id: 'standard',
      name: 'Standard Shipping',
      price: 599, // $5.99 in cents
      description: '5-7 business days',
      estimated_delivery: 'Delivered by Friday, Dec 15',
    },
    {
      id: 'express',
      name: 'Express Shipping',
      price: 1499, // $14.99 in cents
      description: '2-3 business days',
      estimated_delivery: 'Delivered by Wednesday, Dec 13',
    },
  ];

  selectedShippingOption = '';
  selectedPaymentMethod = 'card';

  private subscriptions = new Subscription();

  ngOnInit(): void {
    this.subscriptions.add(
      this.cartService.getCart().subscribe((cart) => {
        this.cart = cart;
        if (!cart || cart.items.length === 0) {
          this.router.navigate(['/cart']);
        }
      }),
    );

    this.subscriptions.add(
      this.authService.getCustomer().subscribe((customer) => {
        this.currentCustomer = customer;
        if (customer) {
          this.contactInfo.email = customer.email;
          this.contactInfo.first_name = customer.first_name || '';
          this.contactInfo.last_name = customer.last_name || '';
        }
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  async loginCustomer(): Promise<void> {
    this.isProcessing = true;
    try {
      await this.authService.login(this.loginData).toPromise();
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  proceedToShipping(): void {
    this.updateStepStatus('contact', 'shipping');
    this.currentStep = 'shipping';

    // Copy contact info to shipping address
    this.shippingAddress.first_name = this.contactInfo.first_name;
    this.shippingAddress.last_name = this.contactInfo.last_name;
  }

  proceedToPayment(): void {
    this.updateStepStatus('shipping', 'payment');
    this.currentStep = 'payment';
  }

  backToContact(): void {
    this.updateStepStatus('shipping', 'contact');
    this.currentStep = 'contact';
  }

  backToShipping(): void {
    this.updateStepStatus('payment', 'shipping');
    this.currentStep = 'shipping';
  }

  selectShippingOption(optionId: string): void {
    this.selectedShippingOption = optionId;
  }

  async completeOrder(): Promise<void> {
    this.isProcessing = true;

    try {
      // In a real implementation, you would:
      // 1. Create order in Medusa
      // 2. Process payment
      // 3. Handle response

      // For now, simulate order completion
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Navigate to confirmation page
      this.router.navigate(['/checkout/confirmation']);
    } catch (error) {
      console.error('Order completion failed:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private updateStepStatus(completedStep: string, currentStep: string): void {
    this.steps.forEach((step) => {
      step.completed = false;
      step.current = false;
    });

    const completedIndex = this.steps.findIndex((s) => s.id === completedStep);
    const currentIndex = this.steps.findIndex((s) => s.id === currentStep);

    for (let i = 0; i <= completedIndex; i++) {
      this.steps[i].completed = true;
    }

    if (currentIndex >= 0) {
      this.steps[currentIndex].current = true;
      this.steps[currentIndex].completed = false;
    }
  }

  formatPrice(amount: number, currency = 'usd'): string {
    return formatPrice(amount, currency);
  }

  getShippingCost(): string {
    const selectedOption = this.shippingOptions.find(
      (opt) => opt.id === this.selectedShippingOption,
    );
    return selectedOption ? this.formatPrice(selectedOption.price) : 'Free';
  }

  getTotalWithShipping(): number {
    const cartTotal = this.cart?.total || 0;
    const selectedOption = this.shippingOptions.find(
      (opt) => opt.id === this.selectedShippingOption,
    );
    const shippingCost = selectedOption ? selectedOption.price : 0;
    return cartTotal + shippingCost;
  }
}
