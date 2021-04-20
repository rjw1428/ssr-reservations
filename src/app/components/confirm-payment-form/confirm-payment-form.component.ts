import { Component, OnInit, ChangeDetectionStrategy, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { filter, first } from 'rxjs/operators';
import { AppActions } from 'src/app/app.action-types';
import { AppState } from 'src/app/models/app-state';
import { Reservation } from 'src/app/models/reservation';
import { UserAccountActions } from 'src/app/user/user.action-types';
import { paymentFeedbackSelector } from 'src/app/user/user.selectors';

@Component({
  selector: 'app-confirm-payment-form',
  templateUrl: './confirm-payment-form.component.html',
  styleUrls: ['./confirm-payment-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmPaymentFormComponent implements OnInit, OnDestroy {
  feedback$ = this.store.select(paymentFeedbackSelector)
  lease: Reservation
  total: number
  constructor(
    private store: Store<AppState>,
    private dialogRef: MatDialogRef<ConfirmPaymentFormComponent>,
    @Inject(MAT_DIALOG_DATA) public paymentInfo: { reservation: Reservation, paymentAmount: number, additionalAmount: number, paymentMethod: string }
  ) { }

  ngOnDestroy() {
    this.store.dispatch(UserAccountActions.resetPaymetFeedback())
  }

  ngOnInit(): void {
    this.total = +this.paymentInfo.additionalAmount + this.paymentInfo.paymentAmount
    this.lease = this.paymentInfo.reservation
  }

  onSave() {
    this.store.dispatch(AppActions.startLoading())

    this.store.dispatch(UserAccountActions.sendCharge({
      sourceId: this.paymentInfo.paymentMethod,
      amount: this.total,
      reservationId: this.lease.id,
      selectedTime: this.lease['unpaidTime'],
      spaceId: this.lease.spaceId,
      productId: this.lease.productId
    }))

    this.feedback$.pipe(
      filter(resp => !!resp),
      first(),
    ).subscribe(({ resp, error }) => {
      if (resp)
        setTimeout(() => this.dialogRef.close(), 500)
    })
  }
}
