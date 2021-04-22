import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { combineLatest, Subscription } from 'rxjs';
import { filter, first, map, shareReplay, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { AppActions } from 'src/app/app.action-types';
import { cachedSpaceSelector, paymentSourceSelector, userSelector, } from 'src/app/app.selectors';
import { AddPaymentMethodComponent } from 'src/app/components/add-payment-method/add-payment-method.component';
import { ConfirmPaymentFormComponent } from 'src/app/components/confirm-payment-form/confirm-payment-form.component';
import { GenericPopupComponent } from 'src/app/components/generic-popup/generic-popup.component';
import { AppState } from 'src/app/models/app-state';
import { Reservation } from 'src/app/models/reservation';
import { UserAccountActions } from '../user.action-types';
import { paymentFeedbackSelector, userUnpaidReservationSelector } from '../user.selectors';
import * as confetti from 'canvas-confetti';
import { confet } from 'src/app/utility/utility';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment-form',
  templateUrl: './payment-form.component.html',
  styleUrls: ['./payment-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentFormComponent implements OnInit, OnDestroy {
  paymentForm: FormGroup
  paymentSources$ = this.store.select(paymentSourceSelector)
  reservations$ = this.store.select(userUnpaidReservationSelector)
  spaceDetails$ = this.store.select(cachedSpaceSelector)
  user$ = this.store.select(userSelector)
  leases$ = combineLatest([this.reservations$, this.spaceDetails$]).pipe(
    filter(([reservations, spaces]) => !!reservations.length && !!spaces),
    map(([reservations, spaces]) =>
      reservations.map(reservation => {
        const space = spaces[reservation.spaceId]
        return { ...reservation, space }
      })
    )
  )
  autoSetPaymentAmountSub: Subscription
  autoSetDefaultPaymentSub: Subscription
  constructor(
    private store: Store<AppState>,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private router: Router
  ) { }

  ngOnDestroy() {
    if (this.autoSetPaymentAmountSub)
      this.autoSetPaymentAmountSub.unsubscribe()
    if (this.autoSetDefaultPaymentSub)
      this.autoSetDefaultPaymentSub.unsubscribe()
  }

  ngOnInit(): void {
    this.reservations$.pipe(
      first(),
      filter(reservation => !reservation.length)
    ).subscribe(() => {
      this.store.dispatch(UserAccountActions.getReservations())
      this.store.dispatch(AppActions.fetchAllSpaceDetails())
    })

    this.autoSetDefaultPaymentSub = this.user$.pipe(shareReplay()).subscribe(user => {
      this.paymentForm = this.formBuilder.group({
        reservation: ['', Validators.required],
        paymentAmount: ['', Validators.required],
        additionalAmount: [''],
        paymentMethod: [user ? user.defaultPaymentSource : '', Validators.required]
      })
    })

    this.autoSetPaymentAmountSub = this.paymentForm.get('reservation').valueChanges.subscribe(reservation => {
      this.paymentForm.patchValue({ paymentAmount: reservation.cost })
    })

    // Listen for payment success
    this.store.select(paymentFeedbackSelector).pipe(
      filter(resp => !!resp),
      filter(({ resp, error }) => !!resp),
      first(),
    ).subscribe(({ resp, error }) => {
      if (resp) {
        setTimeout(() => this.router.navigate(['user', 'transactions']), 500)
        const interval = setInterval(() => confet(), 250)
        setTimeout(() => {
          clearInterval(interval)
        }, 1000 * 2)
      }
    })
  }


  onAddCard() {
    this.dialog.open(AddPaymentMethodComponent, {
      data: null,
      disableClose: true
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
