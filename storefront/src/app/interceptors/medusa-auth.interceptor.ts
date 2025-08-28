import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ConfigService } from '../services/config.service';

export const medusaAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const configService = inject(ConfigService);
  const config = configService.getConfig();

  // Check if config is loaded and if the request is going to Medusa API
  if (config && req.url.includes(config.medusaApiUrl)) {
    // Clone the request and add the publishable API key header
    const authenticatedRequest = req.clone({
      setHeaders: {
        'x-publishable-api-key': config.medusaPublishableApiKey,
      },
    });

    return next(authenticatedRequest);
  }

  // For non-Medusa requests or if config not loaded, pass through without modification
  return next(req);
};
