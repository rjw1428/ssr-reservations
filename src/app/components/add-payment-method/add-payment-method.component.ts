import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { skip, first, filter, takeWhile } from 'rxjs/operators';
import { AppActions } from 'src/app/app.action-types';
import { loadingSelector } from 'src/app/app.selectors';
import { AppState } from 'src/app/models/app-state';
import { UserAccountActions } from 'src/app/user/user.action-types';
import { creditCardFeedbackSelector } from 'src/app/user/user.selectors';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-add-payment-method',
  templateUrl: './add-payment-method.component.html',
  styleUrls: ['./add-payment-method.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddPaymentMethodComponent implements OnInit, OnDestroy {
  cardForm: any
  stripe = Stripe(environment.stripe.apiKey)
  elementStyles = {
    base: {
      fontSize: '14px'
    },
  };
  elements = this.stripe.elements();
  feedback$ = this.store.select(creditCardFeedbackSelector)
  @ViewChild('card') card: ElementRef
  constructor(
    private store: Store<AppState>,
    private dialogRef: MatDialogRef<AddPaymentMethodComponent>
  ) { }

  ngOnDestroy() {
    this.store.dispatch(UserAccountActions.resetCreditCardFeedback())
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.cardForm = this.elements.create('card', {
      style: this.elementStyles
    })
    this.cardForm.mount(this.card.nativeElement)
  }

  async onSave() {
    // Get user stripe id
    this.store.dispatch(AppActions.startLoading())
    const { token } = await this.stripe.createToken(this.cardForm)
    this.store.dispatch(UserAccountActions.addCreditCardToStripe({ token }))

    this.feedback$.pipe(
      filter(resp => !!resp),
      first(),
    ).subscribe(({ resp, error }) => {
      if (resp)
        setTimeout(() => this.dialogRef.close(), 500)
    })
  }
}
