import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations'; // Import provideAnimations
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';  // Import the routes directly
import { provideHttpClient } from '@angular/common/http'; // Import provideHttpClient
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core'; // Import DateAdapter and locale
import { importProvidersFrom } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async'; // Import importProvidersFrom

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),     // Use provideRouter with routes
    provideAnimations(),       // Provide animations for the application
    provideHttpClient(),      // Provide HttpClient for the application
    importProvidersFrom(MatNativeDateModule),  // Add the DateAdapter provider
    { provide: MAT_DATE_LOCALE, useValue: 'en-US' }, provideAnimationsAsync() // Set the locale (optional)
  ]
}).catch(err => console.error(err));
