import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductInquiryComponent } from './product-inquiry.component';

describe('ProductInquiryComponent', () => {
  let component: ProductInquiryComponent;
  let fixture: ComponentFixture<ProductInquiryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductInquiryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProductInquiryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
