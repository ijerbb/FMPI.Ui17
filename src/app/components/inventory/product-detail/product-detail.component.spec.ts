import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ProductDetailComponent } from './product-detail.component';

class MockDomSanitizer {
  bypassSecurityTrustHtml(html: string): SafeHtml { return html as any; }
  bypassSecurityTrustUrl(url: string): any { return url; }
  bypassSecurityTrustStyle(style: string): any { return style; }
  bypassSecurityTrustScript(script: string): any { return script; }
  bypassSecurityTrustResourceUrl(url: string): any { return url; }
}

describe('ProductDetailComponent', () => {
  let component: ProductDetailComponent;
  let fixture: ComponentFixture<ProductDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule, ProductDetailComponent],
      providers: [
        { provide: DomSanitizer, useClass: MockDomSanitizer }
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(ProductDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
