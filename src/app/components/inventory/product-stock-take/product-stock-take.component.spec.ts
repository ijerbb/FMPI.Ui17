import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductStockTakeComponent } from './product-stock-take.component';

describe('ProductStockTakeComponent', () => {
  let component: ProductStockTakeComponent;
  let fixture: ComponentFixture<ProductStockTakeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductStockTakeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProductStockTakeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
