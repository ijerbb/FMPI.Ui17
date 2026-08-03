import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PdfPreviewModalComponent } from './pdf-preview-modal.component';

describe('PdfPreviewModalComponent', () => {
  let component: PdfPreviewModalComponent;
  let fixture: ComponentFixture<PdfPreviewModalComponent>;

  class MockDomSanitizer {
    bypassSecurityTrustResourceUrl(url: string): SafeResourceUrl { return url as SafeResourceUrl; }
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdfPreviewModalComponent],
      providers: [{ provide: DomSanitizer, useClass: MockDomSanitizer }]
    }).compileComponents();

    fixture = TestBed.createComponent(PdfPreviewModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default values', () => {
    expect(component.isLoading).toBe(false);
    expect(component.pdfUrl).toBeNull();
    expect(component.pdfBlob).toBeNull();
    expect(component.transactionInfo).toBe('');
    expect(component.errorMessage).toBe('');
  });

  describe('hideModal', () => {
    it('should reset all state', () => {
      component.pdfUrl = 'blob:url' as SafeResourceUrl;
      component.pdfBlob = new Blob();
      component.transactionInfo = 'Test';
      component.errorMessage = 'Error';

      component.hideModal();

      expect(component.pdfUrl).toBeNull();
      expect(component.pdfBlob).toBeNull();
      expect(component.transactionInfo).toBe('');
      expect(component.errorMessage).toBe('');
    });

    it('should not error when modal element does not exist', () => {
      component.hideModal();
      expect(component).toBeTruthy();
    });
  });

  describe('onDownload', () => {
    it('should not download when no blob', () => {
      component.pdfBlob = null;
      spyOn(component as any, 'hideModal');
      component.onDownload();
      expect(component['hideModal']).not.toHaveBeenCalled();
    });

    it('should hide modal after download', () => {
      component.pdfBlob = new Blob(['test'], { type: 'application/pdf' });
      spyOn(component as any, 'hideModal');
      component.onDownload();
      expect(component['hideModal']).toHaveBeenCalled();
    });
  });

  describe('showPreview', () => {
it('should set state and show modal', () => {
       const testBlob = new Blob(['test pdf'], { type: 'application/pdf' });
       component.showPreview(testBlob, 'Test Transaction');

       expect(component.pdfBlob).toBe(testBlob);
       expect(component.transactionInfo).toBe('Test Transaction');
       expect(component.pdfUrl).toBeTruthy();
       expect(component.isLoading).toBe(false);
     });

    it('should not error when modal element does not exist', () => {
      const testBlob = new Blob(['test'], { type: 'application/pdf' });
      component.showPreview(testBlob, 'Test');
      expect(component.pdfBlob).toBe(testBlob);
    });
  });
});
