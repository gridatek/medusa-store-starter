import { ConfigService } from './config.service';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export function initializeApp(): () => Promise<any> {
  return (): Promise<any> => {
    return firstValueFrom(inject(ConfigService).loadConfig());
  };
}
