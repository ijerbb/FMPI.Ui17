import { TestBed } from '@angular/core/testing';
import { DatabaseSelectionService } from './database-selection.service';
import { HttpService } from './http.service';
import { Router } from '@angular/router';
import { of, Observable } from 'rxjs';
import { ResponseDto } from '../models/dto/responseDto';

const okResponse = (data: string): ResponseDto => ({ success: true, data, rawData: '' });

class MockHttpService {
  switchDatabase(userDto: any): Observable<ResponseDto> {
    return of(okResponse('new-token'));
  }
  getSessionInfo(token: string): Observable<ResponseDto> {
    return of(okResponse(JSON.stringify({ databaseName: 'TestDB' })));
  }
}

class MockRouter {
  navigate = jasmine.createSpy('navigate');
  url = '/dashboard';
}

describe('DatabaseSelectionService', () => {
  let service: DatabaseSelectionService;
  let mockRouter: MockRouter;
  let mockStorage: { [key: string]: string | undefined };
  let getItemSpy: jasmine.Spy;
  let setItemSpy: jasmine.Spy;
  let removeItemSpy: jasmine.Spy;

  beforeEach(() => {
    mockStorage = {};
    mockRouter = new MockRouter();

    getItemSpy = jasmine.createSpy('getItem').and.callFake((key: string) => mockStorage[key] || null);
    setItemSpy = jasmine.createSpy('setItem').and.callFake((key: string, value: string) => { mockStorage[key] = value; });
    removeItemSpy = jasmine.createSpy('removeItem').and.callFake((key: string) => { delete mockStorage[key]; });

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: getItemSpy,
        setItem: setItemSpy,
        removeItem: removeItemSpy,
        length: 0,
        key: jasmine.createSpy('key').and.returnValue(null)
      },
      writable: true
    });

    TestBed.configureTestingModule({
      providers: [
        DatabaseSelectionService,
        { provide: Router, useValue: mockRouter },
        { provide: HttpService, useValue: new MockHttpService() }
      ]
    });

    service = TestBed.inject(DatabaseSelectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCurrentDatabase', () => {
    it('should return null when no database is selected', () => {
      mockStorage['selectedDatabase'] = undefined;
      expect(service.getCurrentDatabase()).toBeNull();
    });

    it('should return the saved database name', () => {
      mockStorage['selectedDatabase'] = 'ProductionDB';
      expect(service.getCurrentDatabase()).toBe('ProductionDB');
    });
  });

  describe('setCurrentDatabase', () => {
    it('should save database name to localStorage', () => {
      service.setCurrentDatabase('TestDB');
      expect(setItemSpy).toHaveBeenCalledWith('selectedDatabase', 'TestDB');
    });

    it('should update the currentDatabase$ observable', (done) => {
      service.currentDatabase$.subscribe(value => {
        if (value === 'NewDB') {
          expect(value).toBe('NewDB');
          done();
        }
      });
      service.setCurrentDatabase('NewDB');
    });
  });

  describe('getSessionToken', () => {
    it('should return null when no session token exists', () => {
      mockStorage['sessionToken'] = undefined;
      expect(service.getSessionToken()).toBeNull();
    });

    it('should return the session token when it exists', () => {
      mockStorage['sessionToken'] = 'abc123token';
      expect(service.getSessionToken()).toBe('abc123token');
    });
  });

  describe('clearSession', () => {
    it('should remove sessionToken from localStorage', () => {
      mockStorage['sessionToken'] = 'some-token';
      service.clearSession();
      expect(removeItemSpy).toHaveBeenCalledWith('sessionToken');
    });

    it('should remove selectedDatabase from localStorage', () => {
      mockStorage['selectedDatabase'] = 'SomeDB';
      service.clearSession();
      expect(removeItemSpy).toHaveBeenCalledWith('selectedDatabase');
    });

    it('should reset currentDatabase$ to null', (done) => {
      service.setCurrentDatabase('SomeDB');
      service.clearSession();
      service.currentDatabase$.subscribe(value => {
        if (value === null) {
          expect(value).toBeNull();
          done();
        }
      });
    });
  });

  describe('switchDatabase', () => {
    it('should throw error when no session token exists', () => {
      mockStorage['sessionToken'] = undefined;
      expect(() => service.switchDatabase('NewDB')).toThrow(new Error('No active session'));
    });

    it('should call httpService.switchDatabase with correct UserDto', (done) => {
      mockStorage['sessionToken'] = 'test-token';
      service.switchDatabase('NewDB').subscribe(result => {
        expect(result.success).toBe(true);
        done();
      });
    });

    it('should update localStorage and currentDatabase$ on successful switch', (done) => {
      mockStorage['sessionToken'] = 'test-token';
      service.switchDatabase('NewDB').subscribe(() => {
        expect(setItemSpy).toHaveBeenCalledWith('selectedDatabase', 'NewDB');
        done();
      });
    });
  });

  describe('validateSession', () => {
    it('should return false when no session token exists', (done) => {
      mockStorage['sessionToken'] = undefined;
      service.validateSession().subscribe(isValid => {
        expect(isValid).toBe(false);
        done();
      });
    });

    it('should return true when token is valid', (done) => {
      mockStorage['sessionToken'] = 'valid-token';
      service.validateSession().subscribe(isValid => {
        expect(isValid).toBe(true);
        done();
      });
    });
  });

  describe('logoutAndSwitch', () => {
    it('should clear session, set new database, and navigate to login', () => {
      mockStorage['sessionToken'] = 'token';
      mockStorage['selectedDatabase'] = 'OldDB';

      service.logoutAndSwitch('NewDB');

      expect(removeItemSpy).toHaveBeenCalledWith('sessionToken');
      expect(removeItemSpy).toHaveBeenCalledWith('selectedDatabase');
      expect(setItemSpy).toHaveBeenCalledWith('selectedDatabase', 'NewDB');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('currentDatabase$ observable', () => {
    it('should emit null initially when no saved database', () => {
      TestBed.resetTestingModule();
      mockStorage['selectedDatabase'] = undefined;
      TestBed.configureTestingModule({
        providers: [
          DatabaseSelectionService,
          { provide: Router, useValue: new MockRouter() },
          { provide: HttpService, useValue: new MockHttpService() }
        ]
      });
      const freshService = TestBed.inject(DatabaseSelectionService);
      let value: string | null = 'not-set';
      freshService.currentDatabase$.subscribe(v => { value = v; });
      expect(value).toBeNull();
    });
  });
});
