// src/app/interceptors/medusa-auth.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '../services/config.service';

@Injectable()
export class MedusaAuthInterceptor implements HttpInterceptor {
  constructor(private configService: ConfigService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const config = this.configService.getConfig();

    // Check if config is loaded and if the request is going to Medusa API
    if (config && request.url.includes(config.medusaApiUrl)) {
      // Clone the request and add the publishable API key header
      const authenticatedRequest = request.clone({
        setHeaders: {
          'x-publishable-api-key': config.medusaPublishableApiKey,
        },
      });

      return next.handle(authenticatedRequest);
    }

    // For non-Medusa requests or if config not loaded, pass through without modification
    return next.handle(request);
  }
}
