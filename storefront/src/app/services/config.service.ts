import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

export interface AppConfig {
  name: string;
  medusaApiUrl: string;
  medusaPublishableApiKey: string;
}

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private readonly http = inject(HttpClient);

  private config: AppConfig | null = null;
  private readonly configSubject = new BehaviorSubject<AppConfig | null>(null);
  public config$ = this.configSubject.asObservable();

  loadConfig(): Observable<AppConfig> {
    return this.http.get<AppConfig>('./assets/config/environment.json').pipe(
      tap((config) => {
        this.config = config;
        this.configSubject.next(config);
      }),
      catchError((error) => {
        console.error('Failed to load configuration:', error);
        throw error;
      }),
    );
  }

  getConfig(): AppConfig | null {
    return this.config;
  }

  get name(): string {
    return this.config?.name || '';
  }

  get medusaApiUrl(): string {
    return this.config?.medusaApiUrl || '';
  }

  get medusaPublishableApiKey(): string {
    return this.config?.medusaPublishableApiKey || '';
  }
}
