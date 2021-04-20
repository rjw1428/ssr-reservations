import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { combineLatest } from 'rxjs';
import { filter, first, map, shareReplay, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { AppActions } from 'src/app/app.action-types';
import { cachedSpaceSelector, paymentSourceSelector, } from 'src/app/app.selectors';
import { AddPaymentMethodComponent } from 'src/app/components/add-payment-method/add-payment-method.component';
import { ConfirmPaymentFormComponent } from 'src/app/components/confirm-payment-form/confirm-payment-form.component';
import { GenericPopupComponent } from 'src/app/components/generic-popup/generic-popup.component';
import { AppState } from 'src/app/models/app-state';
import { Reservation } from 'src/app/models/reservation';
import { UserAccountActions } from '../user.action-types';
import { paymentFeedbackSelector, userUnpaidReservationSelector } from '../user.selectors';

@Component({
  selector: 'app-payment-form',
  templateUrl: './payment-form.component.html',
  styleUrls: ['./payment-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentFormComponent implements OnInit {
  paymentForm: FormGroup
  paymentSources$ = this.store.select(paymentSourceSelector)
  reservations$ = this.store.select(userUnpaidReservationSelector)
  spaceDetails$ = this.store.select(cachedSpaceSelector)

  leases$ = combineLatest([this.reservations$, this.spaceDetails$]).pipe(
    filter(([reservations, spaces]) => !!reservations.length && !!spaces),
    map(([reservations, spaces]) =>
      reservations.map(reservation => {
        const space = spaces[reservation.spaceId]
        return { ...reservation, space }
      })
    ),
  )

  constructor(
    private store: Store<AppState>,
    private formBuilder: FormBuilder,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.reservations$.pipe(
      first(),
      filter(reservation => !reservation.length)
    ).subscribe(() => {
      this.store.dispatch(UserAccountActions.getReservations())
      this.store.dispatch(AppActions.fetchAllSpaceDetails())
    })


    this.paymentForm = this.formBuilder.group({
      reservation: ['', Validators.required],
      paymentAmount: ['', Validators.required],
      additionalAmount: [''],
      paymentMethod: ['', Validators.required]
    })
  }


  onAddCard() {
    this.dialog.open(AddPaymentMethodComponent, {
      data: null
    });
  }


  onTirggerPayment() {
    const currency = new CurrencyPipe('en-US')
    // const datePipe = new DatePipe('en-US')
    const formValue = this.paymentForm.value
    // const payment = currency.transform(formValue.paymentAmount)
    // const additional = currency.transform(formValue.additionalAmount ? formValue.additionalAmount : 0)
    const total = formValue.additionalAmount + formValue.paymentAmount
    // const sourceId = formValue.paymentMethod
    const lease = formValue.reservation as Reservation

    // IF PAYMENT IS NOT ENOUGH, ALERT USER
    if (lease.cost > total)
      return this.dialog.open(GenericPopupComponent, {
        width: '400px',
        data: {
          title: "Payment Error",
          content: `<p>The amount owed for this month is ${currency.transform(lease.cost)}. 
            The amount you entered was not enough to cover that cost. Please return to 
            the payment form and adjust the amount.</p>`
        }
      })


    this.dialog.open(ConfirmPaymentFormComponent, {
      width: '400px',
      data: this.paymentForm.value
    })
  }

  identify(index: number, item: Reservation) {
    return item.id
  }
}
