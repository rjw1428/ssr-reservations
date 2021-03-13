import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ShopProductComponent } from './shop-product.component';

describe('ShopProductComponent', () => {
  let component: ShopProductComponent;
  let fixture: ComponentFixture<ShopProductComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ShopProductComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShopProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
