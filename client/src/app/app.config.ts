import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { definePreset } from '@primeng/themes';
import Lara from '@primeng/themes/lara';

import { routes } from './app.routes';

const SajakKopiPreset = definePreset(Lara, {
  semantic: {
    primary: {
      50: '{stone.50}',
      100: '#EDE6D8',
      200: '#D9C5B3',
      300: '#C4A882',
      400: '#A0764A',
      500: '#8B5A2B',
      600: '#6B4422',
      700: '#4A3B2C',
      800: '#3A2E22',
      900: '#2C2C2C',
      950: '#1a1a1a'
    },
    colorScheme: {
      light: {
        surface: {
          0: '#FFFDF8',
          50: '#F5F0E8',
          100: '#EDE6D8',
          200: '#E0D5C5',
          300: '#D9C5B3',
          400: '#C4A882',
          500: '#A09080',
          600: '#6B6055',
          700: '#4A3B2C',
          800: '#3A2E22',
          900: '#2C2C2C',
          950: '#1a1a1a'
        },
        primary: {
          color: '#4A3B2C',
          contrastColor: '#FFFDF8',
          hoverColor: '#3A2E22',
          activeColor: '#2C2C2C'
        }
      }
    }
  }
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'top' })
    ),
    provideHttpClient(withFetch()),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: SajakKopiPreset,
        options: {
          darkModeSelector: false
        }
      }
    })
  ]
};
