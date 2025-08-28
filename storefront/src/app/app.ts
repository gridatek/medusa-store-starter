import { Component, OnInit, signal } from '@angular/core';

import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header.component';
import { FooterComponent } from './components/footer.component';
import { MedusaApiService } from './services/medusa-api.service';
import { CartService } from './services/cart.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <div data-testid="app-root" class="min-h-screen flex flex-col bg-gray-50">
      <app-header></app-header>

      <main class="flex-1">
        <router-outlet></router-outlet>
      </main>

      <app-footer></app-footer>

      <!-- Loading overlay -->
      @if (isLoading()) {
        <div
          data-testid="loading-spinner"
          class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
        >
          <div class="bg-white rounded-lg p-6 flex items-center space-x-4">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span class="text-gray-900">Loading...</span>
          </div>
        </div>
      }
    </div>
  `,
  styles: [],
})
export class App implements OnInit {
  isLoading = signal(false);

  constructor(
    private medusaApi: MedusaApiService,
    private cartService: CartService,
  ) {}

  async ngOnInit() {
    this.isLoading.set(true);

    try {
      // Initialize app data
      await this.medusaApi.initializeRegion();
      await this.cartService.initializeCart();
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      this.isLoading.set(false);
    }
  }
}
