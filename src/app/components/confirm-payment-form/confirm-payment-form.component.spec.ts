import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmPaymentFormComponent } from './confirm-payment-form.component';

describe('ConfirmPaymentFormComponent', () => {
  let component: ConfirmPaymentFormComponent;
  let fixture: ComponentFixture<ConfirmPaymentFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfirmPaymentFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmPaymentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
