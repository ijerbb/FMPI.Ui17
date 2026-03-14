import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { DatabaseSelectionService } from '../services/database-selection.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private dbService: DatabaseSelectionService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    // Check if we're already on login page to prevent loops
    const currentUrl = this.router.url;
    if (currentUrl === '/login') {
      return of(true);
    }

    return this.dbService.validateSession().pipe(
      map(isValid => {
        if (!isValid) {
          this.router.navigate(['/login']);
          return false;
        }
        return true;
      }),
      catchError(() => {
        this.router.navigate(['/login']);
        return of(false);
      })
    );
  }
}
