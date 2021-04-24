import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ElementRef, OnDestroy, HostListener } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
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
  makeDefault = new FormControl(false)
  cardError: { code: string, type: string, message: string } | undefined
  @ViewChild('card') card: ElementRef
  constructor(
    private store: Store<AppState>,
    private dialogRef: MatDialogRef<AddPaymentMethodComponent>
  ) { }

  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key == 'Enter')
      this.onSave()
  }

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
    this.cardError = { code: null, type: null, message: "Your card number is incomplete." }
    this.cardForm.on('change', event => {
      this.cardError = event.error
    })
  }

  async onSave() {
    this.store.dispatch(UserAccountActions.resetCreditCardFeedback())

    if (this.cardError)
      return this.store.dispatch(UserAccountActions.creditCardSaved({ resp: null, error: { raw: { message: this.cardError.message } } }))

    // Get user stripe id
    this.store.dispatch(AppActions.startLoading())
    const { token } = await this.stripe.createToken(this.cardForm)
    this.store.dispatch(UserAccountActions.addCreditCardToStripe({ token, isDefault: this.makeDefault.value }))

    this.feedback$.pipe(
      filter(resp => !!resp),
      filter(({ resp, error }) => !!resp),
      first()
    ).subscribe(({ resp, error }) =>
      setTimeout(() => this.dialogRef.close(), 500)
    )
  }
}
