import { Component, OnInit, ChangeDetectionStrategy, Inject, OnDestroy, HostListener } from '@angular/core';
import { AngularFirePerformance } from '@angular/fire/performance';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { filter, first } from 'rxjs/operators';
import { AppActions } from 'src/app/app.action-types';
import { userSelector } from 'src/app/app.selectors';
import { AppState } from 'src/app/models/app-state';
import { Reservation } from 'src/app/models/reservation';
import { User } from 'src/app/models/user';
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
  user$ = this.store.select(userSelector)
  lease: Reservation
  total: number
  constructor(
    private performance: AngularFirePerformance,
    private store: Store<AppState>,
    private dialogRef: MatDialogRef<ConfirmPaymentFormComponent>,
    @Inject(MAT_DIALOG_DATA) public paymentInfo: {
      reservation: Reservation,
      paymentAmount: number,
      additionalAmount: number,
      paymentMethod: string
    }
  ) { }

  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key == 'Enter')
      this.user$.pipe(first()).subscribe(user => {
        this.onSave(user)
      })
  }


  ngOnDestroy() {
    this.store.dispatch(UserAccountActions.resetPaymetFeedback())
  }

  ngOnInit(): void {
    this.total = +this.paymentInfo.additionalAmount + this.paymentInfo.paymentAmount
    this.lease = this.paymentInfo.reservation
  }

  async onSave(user: User) {
    const trace = await this.performance.trace('paymentCompletion')
    trace.start()
    this.store.dispatch(AppActions.startLoading())
    this.store.dispatch(UserAccountActions.sendCharge({
      sourceId: this.paymentInfo.paymentMethod,
      amount: this.total,
      reservationId: this.lease.id,
      selectedTime: +this.lease['unpaidTime'],
      space: this.lease['space'],
      user
    }))

    this.feedback$.pipe(
      filter(resp => !!resp),
      filter(({ resp, error }) => !!resp),
      first(),
    ).subscribe(({ resp, error }) => {
      trace.stop()
      if (resp)
        setTimeout(() => this.dialogRef.close(), 500)
    })
  }
}
