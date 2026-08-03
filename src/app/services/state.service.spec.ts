import { TestBed } from '@angular/core/testing';
import { StateService } from './state.service';

describe('StateService', () => {
  let service: StateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('state$ should be a BehaviorSubject that emits null initially', () => {
    let emittedValue: any;
    service.state$.subscribe(value => {
      emittedValue = value;
    });
    expect(emittedValue).toBeNull();
  });

  it('search$ should be a BehaviorSubject that emits null initially', () => {
    let emittedValue: any;
    service.search$.subscribe(value => {
      emittedValue = value;
    });
    expect(emittedValue).toBeNull();
  });

  it('state$ should emit updated values when changed', (done) => {
    service.state$.subscribe(value => {
      if (value !== null) {
        expect(value).toEqual({ key: 'value', count: 42 });
        done();
      }
    });
    service.state$.next({ key: 'value', count: 42 });
  });

  it('search$ should emit updated values when changed', (done) => {
    service.search$.subscribe(value => {
      if (value !== null) {
        expect(value).toEqual({ term: 'search', page: 2 });
        done();
      }
    });
    service.search$.next({ term: 'search', page: 2 });
  });

  it('state$ should retain last emitted value for new subscribers', () => {
    service.state$.next({ data: 'test' });
    let lastValue: any;
    service.state$.subscribe(value => {
      lastValue = value;
    });
    expect(lastValue).toEqual({ data: 'test' });
  });

  it('search$ should retain last emitted value for new subscribers', () => {
    service.search$.next({ data: 'test' });
    let lastValue: any;
    service.search$.subscribe(value => {
      lastValue = value;
    });
    expect(lastValue).toEqual({ data: 'test' });
  });

  it('should allow multiple subscribers to state$', (done) => {
    let count = 0;
    service.state$.subscribe(value => {
      if (value === 'subscriber1') count++;
    });
    service.state$.subscribe(value => {
      if (value === 'subscriber1') count++;
    });
    service.state$.next('subscriber1');
    setTimeout(() => {
      expect(count).toBe(2);
      done();
    }, 10);
  });

  it('should support complex objects in state$', (done) => {
    const complexObj = {
      user: { name: 'John', age: 30 },
      items: [1, 2, 3],
      settings: { theme: 'dark', lang: 'en' }
    };
    service.state$.next(complexObj);
    service.state$.subscribe(value => {
      expect(value).toEqual(complexObj);
      expect(value.user.name).toBe('John');
      expect(value.items.length).toBe(3);
      done();
    });
  });
});
