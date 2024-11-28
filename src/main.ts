import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';  // Import routes from app.routes.ts
import { DataListComponent } from './app/data-list/data-list.component';  // Import your component
import { provideHttpClient } from '@angular/common/http';  // Import provideHttpClient

// Bootstrap the application with the router and provide HttpClientModule
bootstrapApplication(DataListComponent, {
  providers: [
    provideRouter(routes),  // Provide the routes using `provideRouter`
    provideHttpClient(),     // Provide HttpClient for HTTP requests
  ],
}).catch(err => console.error(err));
