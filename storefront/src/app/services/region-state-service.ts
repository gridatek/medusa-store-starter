import { httpResource, HttpResourceRequest } from '@angular/common/http';
import { computed, effect, Injectable, signal } from '@angular/core';
import { Region, STORAGE_KEYS } from '../../../../shared/src/types';

@Injectable({
  providedIn: 'root',
})
export class RegionStateService {
  // Selected region signal - the source of truth
  private readonly selectedRegionId = signal<string | null>(this.getStoredRegionId());

  // HTTP Resource for fetching all available regions
  private readonly regionsResource = httpResource<Region[]>(
    () =>
      ({
        url: '/store/regions',
        method: 'GET',
      }) as HttpResourceRequest,
    {
      defaultValue: [],
    },
  );

  // HTTP Resource for fetching current selected region details
  private readonly currentRegionResource = httpResource<Region>(() => {
    const regionId = this.selectedRegionId();
    if (!regionId) return undefined;

    return {
      url: `/store/regions/${regionId}`,
      method: 'GET',
    } as HttpResourceRequest;
  });

  // Public readonly computed signals
  readonly regions = computed(() => this.regionsResource.value() ?? []);
  readonly currentRegion = computed(() => this.currentRegionResource.value() ?? null);
  readonly isLoadingRegions = computed(() => this.regionsResource.isLoading());
  readonly isLoadingCurrentRegion = computed(() => this.currentRegionResource.isLoading());
  readonly regionsError = computed(() => this.regionsResource.error());
  readonly currentRegionError = computed(() => this.currentRegionResource.error());

  // Computed signals for common region data
  readonly currentCurrency = computed(() => this.currentRegion()?.currency_code ?? 'USD');
  readonly currentCountries = computed(() => this.currentRegion()?.countries ?? []);
  readonly currentTaxRate = computed(() => this.currentRegion()?.tax_rate ?? 0);

  // Check if a region is selected
  readonly hasSelectedRegion = computed(() => !!this.selectedRegionId());

  constructor() {
    // Effect to sync region changes to localStorage (only when needed)
    effect(() => {
      const regionId = this.selectedRegionId();
      const storedRegionId = this.getStoredRegionId();

      if (regionId !== storedRegionId) {
        if (regionId) {
          localStorage.setItem(STORAGE_KEYS.REGION_ID, regionId);
        } else {
          localStorage.removeItem(STORAGE_KEYS.REGION_ID);
        }
      }
    });

    // Effect to auto-select first region if none selected
    effect(() => {
      const regions = this.regions();
      const currentRegionId = this.selectedRegionId();

      if (regions.length > 0 && !currentRegionId) {
        // Auto-select the first region if none is selected
        this.selectRegion(regions[0].id);
      }
    });

    // Effect to handle region loading errors
    effect(() => {
      const error = this.regionsResource.error();
      if (error) {
        console.error('Error loading regions:', error);
      }
    });

    effect(() => {
      const error = this.currentRegionResource.error();
      if (error) {
        console.error('Error loading current region:', error);
        // If region doesn't exist, clear selection
        //TODO
        // if (error.status === 404) {
        //   this.clearRegion();
        // }
      }
    });
  }

  // Public methods
  selectRegion(regionId: string): void {
    this.selectedRegionId.set(regionId);
  }

  clearRegion(): void {
    this.selectedRegionId.set(null);
  }

  // Refresh regions data
  refreshRegions(): void {
    this.regionsResource.reload();
  }

  // Get region by ID
  getRegionById(regionId: string): Region | null {
    return this.regions().find((region) => region.id === regionId) ?? null;
  }

  // Check if a region has a specific country
  hasCountry(countryCode: string): boolean {
    return this.currentCountries().some(
      (country) => country.iso_2?.toLowerCase() === countryCode.toLowerCase(),
    );
  }

  // Format price with current region currency
  formatPrice(amount: number): string {
    const currency = this.currentCurrency();
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency,
    }).format(amount / 100); // Assuming amount is in cents
  }

  // Get stored region ID from localStorage
  private getStoredRegionId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEYS.REGION_ID);
  }
}
