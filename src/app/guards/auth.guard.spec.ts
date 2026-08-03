import { TestBed } from '@angular/core/testing';
import { AuthGuard } from './auth.guard';
import { DatabaseSelectionService } from '../services/database-selection.service';
import { Router } from '@angular/router';
import { of, Observable } from 'rxjs';
import { ResponseDto } from '../models/dto/responseDto';

class MockDatabaseSelectionService {
  validateSession = jasmine.createSpy('validateSession').and.returnValue(of(true));
  getCurrentDatabase = jasmine.createSpy('getCurrentDatabase').and.returnValue('TestDB');
  getSessionToken = jasmine.createSpy('getSessionToken').and.returnValue('token123');
}

class MockRouter {
  navigate = jasmine.createSpy('navigate');
  url = '/dashboard';
}

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let dbService: MockDatabaseSelectionService;
  let router: MockRouter;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: DatabaseSelectionService, useClass: MockDatabaseSelectionService },
        { provide: Router, useClass: MockRouter }
      ]
    });

    guard = TestBed.inject(AuthGuard);
    dbService = TestBed.inject(DatabaseSelectionService as any) as any;
    router = TestBed.inject(Router as any) as any;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should return true for valid session', (done) => {
    dbService.validateSession.and.returnValue(of(true));

    guard.canActivate().subscribe(isValid => {
      expect(isValid).toBe(true);
      expect(router.navigate).not.toHaveBeenCalled();
      done();
    });
  });

  it('should return false and redirect to login for invalid session', (done) => {
    dbService.validateSession.and.returnValue(of(false));

    guard.canActivate().subscribe(isValid => {
      expect(isValid).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
      done();
    });
  });

  it('should return true and not redirect when already on login page', () => {
    router.url = '/login';
    dbService.validateSession.and.returnValue(of(true));

    guard.canActivate().subscribe(isValid => {
      expect(isValid).toBe(true);
      expect(dbService.validateSession).not.toHaveBeenCalled();
    });
  });

  it('should handle errors and redirect to login', (done) => {
    dbService.validateSession.and.returnValue(of(false));

    guard.canActivate().subscribe(isValid => {
      expect(isValid).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
      done();
    });
  });

  it('should call dbService.validateSession on canActivate', () => {
    dbService.validateSession.and.returnValue(of(true));
    router.url = '/dashboard';

    guard.canActivate().subscribe(() => {
      expect(dbService.validateSession).toHaveBeenCalled();
    });
  });

  it('should allow navigation when session is valid and not on login page', (done) => {
    router.url = '/products';
    dbService.validateSession.and.returnValue(of(true));

    guard.canActivate().subscribe(isValid => {
      expect(isValid).toBe(true);
      expect(router.navigate).not.toHaveBeenCalled();
      done();
    });
  });
});
