import { TestBed } from '@angular/core/testing';
import { SessionInterceptor } from './session.interceptor';
import { DatabaseSelectionService } from '../services/database-selection.service';
import { Observable } from 'rxjs';
import { HttpRequest, HttpHandler, HttpEvent, HttpHeaders } from '@angular/common/http';

describe('SessionInterceptor', () => {
  let interceptor: SessionInterceptor;

  it('should be created', () => {
    TestBed.configureTestingModule({
      providers: [
        SessionInterceptor,
        { provide: DatabaseSelectionService, useValue: { getSessionToken: () => 'test-token' } }
      ]
    });
    interceptor = TestBed.inject(SessionInterceptor);
    expect(interceptor).toBeTruthy();
  });

  it('should add X-Session-Token header when token exists', (done) => {
    TestBed.configureTestingModule({
      providers: [
        SessionInterceptor,
        { provide: DatabaseSelectionService, useValue: { getSessionToken: () => 'my-token' } }
      ]
    });
    interceptor = TestBed.inject(SessionInterceptor);

    const testRequest = new HttpRequest('GET', '/api/test');
    const handlerMock: HttpHandler = {
      handle: (req: HttpRequest<any>): Observable<HttpEvent<any>> => {
        expect(req.headers.get('X-Session-Token')).toBe('my-token');
        return new Observable<HttpEvent<any>>(observer => {
          observer.next({ type: 0 } as HttpEvent<any>);
          observer.complete();
        });
      }
    };

    interceptor.intercept(testRequest, handlerMock).subscribe({
      complete: () => done(),
      error: done.fail
    });
  });

  it('should not add header when no token exists', (done) => {
    TestBed.configureTestingModule({
      providers: [
        SessionInterceptor,
        { provide: DatabaseSelectionService, useValue: { getSessionToken: () => null } }
      ]
    });
    interceptor = TestBed.inject(SessionInterceptor);

    const testRequest = new HttpRequest('GET', '/api/test');
    const handlerMock: HttpHandler = {
      handle: (req: HttpRequest<any>): Observable<HttpEvent<any>> => {
        expect(req.headers.get('X-Session-Token')).toBeNull();
        return new Observable<HttpEvent<any>>(observer => {
          observer.next({ type: 0 } as HttpEvent<any>);
          observer.complete();
        });
      }
    };

    interceptor.intercept(testRequest, handlerMock).subscribe({
      complete: () => done(),
      error: done.fail
    });
  });

  it('should pass through the request when no token', (done) => {
    TestBed.configureTestingModule({
      providers: [
        SessionInterceptor,
        { provide: DatabaseSelectionService, useValue: { getSessionToken: () => null } }
      ]
    });
    interceptor = TestBed.inject(SessionInterceptor);

    const testRequest = new HttpRequest('POST', '/api/data', { body: 'test' });
    const handlerMock: HttpHandler = {
      handle: (req: HttpRequest<any>): Observable<HttpEvent<any>> => {
        expect(req.method).toBe('POST');
        expect(req.headers.get('X-Session-Token')).toBeNull();
        return new Observable<HttpEvent<any>>(observer => {
          observer.next({ type: 0 } as HttpEvent<any>);
          observer.complete();
        });
      }
    };

    interceptor.intercept(testRequest, handlerMock).subscribe({
      complete: () => done(),
      error: done.fail
    });
  });

  it('should preserve existing headers when adding session token', (done) => {
    TestBed.configureTestingModule({
      providers: [
        SessionInterceptor,
        { provide: DatabaseSelectionService, useValue: { getSessionToken: () => 'session-token' } }
      ]
    });
    interceptor = TestBed.inject(SessionInterceptor);

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer xyz'
    });
    const testRequest = new HttpRequest('GET', '/api/test', { headers });
    const handlerMock: HttpHandler = {
      handle: (req: HttpRequest<any>): Observable<HttpEvent<any>> => {
        expect(req.headers.get('X-Session-Token')).toBe('session-token');
        expect(req.headers.get('Content-Type')).toBe('application/json');
        expect(req.headers.get('Authorization')).toBe('Bearer xyz');
        return new Observable<HttpEvent<any>>(observer => {
          observer.next({ type: 0 } as HttpEvent<any>);
          observer.complete();
        });
      }
    };

    interceptor.intercept(testRequest, handlerMock).subscribe({
      complete: () => done(),
      error: done.fail
    });
  });

  it('should handle POST requests with session token', (done) => {
    TestBed.configureTestingModule({
      providers: [
        SessionInterceptor,
        { provide: DatabaseSelectionService, useValue: { getSessionToken: () => 'post-session-token' } }
      ]
    });
    interceptor = TestBed.inject(SessionInterceptor);

    const testRequest = new HttpRequest('POST', '/api/submit', { data: 'payload' });
    const handlerMock: HttpHandler = {
      handle: (req: HttpRequest<any>): Observable<HttpEvent<any>> => {
        expect(req.headers.get('X-Session-Token')).toBe('post-session-token');
        expect(req.method).toBe('POST');
        return new Observable<HttpEvent<any>>(observer => {
          observer.next({ type: 0 } as HttpEvent<any>);
          observer.complete();
        });
      }
    };

    interceptor.intercept(testRequest, handlerMock).subscribe({
      complete: () => done(),
      error: done.fail
    });
  });
});
