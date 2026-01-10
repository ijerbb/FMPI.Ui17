import { ApplicationConfig } from '@angular/core';
import { provideRouter, Route, RouterLink } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { NgbDateAdapter, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { CustomDateParserFormatter } from './custom-date-parser-formatter';
import { NgbDateStringAdapter } from './custom-date-adapter';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter },
    { provide: NgbDateAdapter, useClass: NgbDateStringAdapter }
  ]
};
