import { ApplicationConfig } from '@angular/core';
import { provideRouter, Route, RouterLink } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgbDateAdapter, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { CustomDateParserFormatter } from './custom-date-parser-formatter';
import { NgbDateStringAdapter } from './custom-date-adapter';
import { SessionInterceptor } from './interceptors/session.interceptor';
import { provideCharts } from 'ng2-charts';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter },
    { provide: NgbDateAdapter, useClass: NgbDateStringAdapter },
    { provide: HTTP_INTERCEPTORS, useClass: SessionInterceptor, multi: true },
    provideCharts()
  ]
};
