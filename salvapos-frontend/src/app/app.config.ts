import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  HttpClientModule,
  provideHttpClient,
  withFetch,
} from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),

    importProvidersFrom(HttpClientModule),
<<<<<<< HEAD
    provideHttpClient(withFetch()), provideAnimationsAsync(),
=======
    provideHttpClient(withFetch()),
    provideAnimationsAsync(),
>>>>>>> 07c5c01de60f7029ea91f961ad84f5078e86a138
  ],
};
