import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpInterceptorFn
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { DatabaseSelectionService } from '../services/database-selection.service';

@Injectable()
export class SessionInterceptor implements HttpInterceptor {
  constructor(private dbService: DatabaseSelectionService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const sessionToken = this.dbService.getSessionToken();
    
    if (sessionToken) {
      request = request.clone({
        setHeaders: {
          'X-Session-Token': sessionToken
        }
      });
    }
    
    return next.handle(request);
  }
}
