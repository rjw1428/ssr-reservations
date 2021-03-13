import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CurrentReservationsComponent } from './current-reservations.component';

describe('CurrentReservationsComponent', () => {
  let component: CurrentReservationsComponent;
  let fixture: ComponentFixture<CurrentReservationsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CurrentReservationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrentReservationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
