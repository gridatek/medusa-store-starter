import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Customer, Order } from '../../../../shared/src/types';

@Component({
  selector: 'app-account',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-gray-900">My Account</h1>
        <button
          class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          (click)="logout()"
        >
          Sign Out
        </button>
      </div>

      @if (customer) {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Account Info -->
          <div class="lg:col-span-2">
            <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 class="text-xl font-semibold mb-4">Account Information</h2>
              <form (ngSubmit)="updateProfile()" #profileForm="ngForm">
                <div class="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      [(ngModel)]="customer.first_name"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      [(ngModel)]="customer.last_name"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    [(ngModel)]="customer.email"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    [(ngModel)]="customer.phone"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Update Profile
                </button>
              </form>
            </div>
            <!-- Order History -->
            <div class="bg-white rounded-lg shadow-sm p-6">
              <h2 class="text-xl font-semibold mb-4">Order History</h2>
              @if (orders.length === 0) {
                <div class="text-center py-8 text-gray-500">
                  <p>No orders yet</p>
                  <a href="/products" class="text-blue-600 hover:text-blue-800">Start shopping</a>
                </div>
              }
              @if (orders.length > 0) {
                <div class="space-y-4">
                  @for (order of orders; track order) {
                    <div class="border border-gray-200 rounded-lg p-4">
                      <div class="flex justify-between items-start">
                        <div>
                          <h3 class="font-medium text-gray-900">Order #{{ order.display_id }}</h3>
                          <p class="text-sm text-gray-500">{{ order.created_at | date }}</p>
                          <p class="text-sm">
                            <span class="font-medium">Status:</span>
                            <span [class]="getStatusColor(order.status)">{{
                              order.status | titlecase
                            }}</span>
                          </p>
                        </div>
                        <div class="text-right">
                          <p class="font-medium">
                            {{ formatPrice(order.total, order.currency_code) }}
                          </p>
                          <button class="text-blue-600 hover:text-blue-800 text-sm mt-1">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
          <!-- Sidebar -->
          <div>
            <div class="bg-white rounded-lg shadow-sm p-6">
              <h3 class="text-lg font-semibold mb-4">Quick Actions</h3>
              <div class="space-y-3">
                <a href="/account/orders" class="block text-blue-600 hover:text-blue-800"
                  >View All Orders</a
                >
                <a href="/account/addresses" class="block text-blue-600 hover:text-blue-800"
                  >Manage Addresses</a
                >
                <a href="/account/security" class="block text-blue-600 hover:text-blue-800"
                  >Security Settings</a
                >
                <button
                  class="block text-red-600 hover:text-red-800 w-full text-left"
                  (click)="logout()"
                >
                  Sign Out
                </button>
              </div>
            </div>
            <div class="bg-white rounded-lg shadow-sm p-6 mt-6">
              <h3 class="text-lg font-semibold mb-4">Account Stats</h3>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-gray-600">Member since:</span>
                  <span class="font-medium">{{ customer.created_at | date: 'mediumDate' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Total orders:</span>
                  <span class="font-medium">{{ orders.length }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class AccountComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);

  customer: Customer | null = null;
  orders: Order[] = [];

  private subscriptions = new Subscription();

  ngOnInit(): void {
    this.subscriptions.add(
      this.authService.getCustomer().subscribe((customer) => {
        this.customer = customer;
        if (customer) {
          // Load customer orders - you'd need to implement this in the API service
          // this.loadOrders();
        }
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  updateProfile(): void {
    // Implement profile update logic
    console.log('Update profile:', this.customer);
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      window.location.href = '/';
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'canceled':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }

  formatPrice(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount / 100);
  }
}
