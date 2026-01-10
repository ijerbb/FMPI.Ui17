import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductStockTakeDetailComponent } from './product-stock-take-detail.component';

describe('ProductStockTakeDetailComponent', () => {
  let component: ProductStockTakeDetailComponent;
  let fixture: ComponentFixture<ProductStockTakeDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductStockTakeDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProductStockTakeDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
