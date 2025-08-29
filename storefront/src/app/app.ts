import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './components/footer.component';
import { HeaderComponent } from './components/header.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <div data-testid="app-root" class="min-h-screen flex flex-col bg-gray-50">
      <app-header />

      <main class="flex-1">
        <router-outlet />
      </main>

      <app-footer />
    </div>
  `,
  styles: [],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
