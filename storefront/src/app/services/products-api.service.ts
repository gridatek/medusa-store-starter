import { HttpParams, httpResource } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ENDPOINTS, ProductResponse, ProductsResponse } from '../../../../shared/src/types';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class ProductsApiService {
  private readonly configService = inject(ConfigService);

  private get apiBaseUrl(): string {
    return this.configService.medusaApiUrl;
  }

  createProductsResource(params?: {
    offset?: number;
    limit?: number;
    q?: string;
    collection_id?: string[];
    type_id?: string[];
    tags?: string[];
    region_id?: string;
  }) {
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

    return httpResource<ProductsResponse>(() => {
      return {
        url: url,
        params: httpParams,
      };
    });
  }

  createProductResource(id: string | undefined) {
    if (!id) {
      return undefined;
    }

    const url = `${this.apiBaseUrl}${ENDPOINTS.PRODUCT_BY_ID(id)}`;

    return httpResource<ProductResponse>(() => {
      return {
        url: url,
      };
    });
  }

  createSearchProductsResource(query: string) {
    return this.createProductsResource({ q: query, limit: 10 });
  }
}
