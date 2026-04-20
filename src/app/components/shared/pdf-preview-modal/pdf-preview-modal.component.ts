import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-pdf-preview-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal fade" id="pdfPreviewModal" tabindex="-1" role="dialog" aria-labelledby="pdfPreviewModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-xl" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="pdfPreviewModalLabel">
              <i class="bi bi-file-earmark-pdf"></i> PDF Preview - {{transactionInfo}}
            </h5>
            <button type="button" class="btn-close" aria-label="Close" (click)="hideModal()"></button>
          </div>
          <div class="modal-body" style="min-height: 600px; background-color: #f5f5f5;">
            <div *ngIf="isLoading" class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="mt-2">Generating PDF preview...</p>
            </div>
            <div *ngIf="!isLoading && pdfUrl" class="text-center">
              <iframe [src]="pdfUrl" width="100%" height="600px" style="border: 1px solid #ddd;"></iframe>
            </div>
            <div *ngIf="!isLoading && !pdfUrl && errorMessage" class="text-center text-danger py-5">
              <i class="bi bi-exclamation-triangle display-4"></i>
              <p class="mt-3">{{errorMessage}}</p>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="hideModal()">
              <i class="bi bi-x-circle"></i> Close
            </button>
            <button type="button" class="btn btn-success" (click)="onDownload()" [disabled]="!pdfBlob">
              <i class="bi bi-download"></i> Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class PdfPreviewModalComponent {
  isLoading: boolean = false;
  pdfUrl: SafeResourceUrl | null = null;
  pdfBlob: Blob | null = null;
  transactionInfo: string = '';
  errorMessage: string = '';
  private backdropElement: HTMLElement | null = null;

  constructor(private sanitizer: DomSanitizer) {}

  hideModal() {
    const modal = document.getElementById('pdfPreviewModal');
    if (modal) {
      modal.classList.remove('show');
      modal.style.display = 'none';
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      
      // Remove backdrop
      if (this.backdropElement) {
        this.backdropElement.remove();
        this.backdropElement = null;
      }
    }
    
    // Clean up blob URL
    if (this.pdfUrl) {
      // Don't revoke - Angular's sanitizer handles it
      this.pdfUrl = null;
    }
    this.pdfBlob = null;
    this.transactionInfo = '';
    this.errorMessage = '';
  }

  onDownload() {
    if (this.pdfBlob) {
      const url = window.URL.createObjectURL(this.pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BIR2307_${Date.now()}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      this.hideModal();
    }
  }

  showPreview(pdfBlob: Blob, transactionInfo: string) {
    this.isLoading = true;
    this.pdfBlob = pdfBlob;
    this.transactionInfo = transactionInfo;
    this.errorMessage = '';
    this.pdfUrl = null;
    
    // Create safe URL for iframe
    const blobUrl = window.URL.createObjectURL(pdfBlob);
    this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
    this.isLoading = false;

    // Show modal using Bootstrap classes
    const modal = document.getElementById('pdfPreviewModal');
    if (modal) {
      modal.classList.add('show');
      modal.style.display = 'block';
      document.body.classList.add('modal-open');
      document.body.style.overflow = 'hidden';
      
      // Add backdrop
      this.backdropElement = document.createElement('div');
      this.backdropElement.className = 'modal-backdrop fade show';
      this.backdropElement.setAttribute('data-bs-dismiss', 'modal');
      this.backdropElement.addEventListener('click', () => this.hideModal());
      document.body.appendChild(this.backdropElement);
    }
  }
}
