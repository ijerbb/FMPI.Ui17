import { TestBed } from '@angular/core/testing';
import { AlertService } from './alert.service';

describe('AlertService', () => {
  let service: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AlertService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('successAlert should emit true when setSuccessAlert is called', (done) => {
    const subscription = service.successAlert.subscribe(value => {
      expect(value).toBe(true);
      subscription.unsubscribe();
      done();
    });
    service.setSuccessAlert();
  });

  it('errorAlert should emit true when setErrorAlert is called', (done) => {
    const subscription = service.errorAlert.subscribe(value => {
      expect(value).toBe(true);
      subscription.unsubscribe();
      done();
    });
    service.setErrorAlert();
  });

  it('setCustomSuccessAlert should emit the message', (done) => {
    const message = 'Operation completed successfully';
    const subscription = service.customSuccessAlert.subscribe(value => {
      expect(value).toBe(message);
      subscription.unsubscribe();
      done();
    });
    service.setCustomSuccessAlert(message);
  });

  it('setCustomErrorAlert should emit the error message', (done) => {
    const message = 'Something went wrong';
    const subscription = service.customErrorAlert.subscribe(value => {
      expect(value).toBe(message);
      subscription.unsubscribe();
      done();
    });
    service.setCustomErrorAlert(message);
  });

  it('setCustomInfoAlert should emit the info message', (done) => {
    const message = 'Information message here';
    const subscription = service.customInfoAlert.subscribe(value => {
      expect(value).toBe(message);
      subscription.unsubscribe();
      done();
    });
    service.setCustomInfoAlert(message);
  });

  it('should handle multiple success alerts', (done) => {
    let callCount = 0;
    service.successAlert.subscribe(value => {
      callCount++;
      if (callCount === 1) {
        expect(value).toBe(true);
        service.setSuccessAlert();
      } else if (callCount === 2) {
        expect(value).toBe(true);
        done();
      }
    });
    service.setSuccessAlert();
  });

  it('should handle multiple custom alerts with different messages', (done) => {
    let callCount = 0;
    service.customSuccessAlert.subscribe(value => {
      callCount++;
      if (callCount === 1) {
        expect(value).toBe('First message');
        const sub = service.customErrorAlert.subscribe(eValue => {
          expect(eValue).toBe('Error message');
          const sub2 = service.customInfoAlert.subscribe(iValue => {
            expect(iValue).toBe('Info message');
            sub2.unsubscribe();
            done();
          });
          service.setCustomInfoAlert('Info message');
          sub.unsubscribe();
        });
        service.setCustomErrorAlert('Error message');
      }
    });
    service.setCustomSuccessAlert('First message');
  });

  it('successAlert and errorAlert should be independent observables', (done) => {
    let successCount = 0;
    let errorCount = 0;

    service.successAlert.subscribe(() => { successCount++; });
    service.errorAlert.subscribe(() => { errorCount++; });

    service.setSuccessAlert();
    setTimeout(() => {
      service.setErrorAlert();
      setTimeout(() => {
        expect(successCount).toBe(1);
        expect(errorCount).toBe(1);
        done();
      }, 10);
    }, 10);
  });
});
