import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { skip, first, filter } from 'rxjs/operators';
import { productTypeSubmissionSuccessSelector } from 'src/app/admin/admin.selectors';
import { AppState } from 'src/app/models/app-state';
import { UserAccountActions } from 'src/app/user/user.action-types';
import { stripeDataProcessingSelector } from 'src/app/user/user.selectors';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-add-payment-method',
  templateUrl: './add-payment-method.component.html',
  styleUrls: ['./add-payment-method.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddPaymentMethodComponent implements OnInit {
  cardForm: any
  stripe = Stripe(environment.stripe.apiKey)
  elementStyles = {
    base: {
      fontSize: '14px'
    },
  };
  elements = this.stripe.elements();
  @ViewChild('card') card: ElementRef
  constructor(
    private store: Store<AppState>,
    private dialogRef: MatDialogRef<AddPaymentMethodComponent>
  ) { }

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
    const { token } = await this.stripe.createToken(this.cardForm)
    this.store.dispatch(UserAccountActions.startLoading())
    this.store.dispatch(UserAccountActions.addCreditCardToStripe({ token }))

    this.store.select(stripeDataProcessingSelector).pipe(
      skip(1),
      first(),
      filter((resp) => !resp)
    ).subscribe((isStillSaving) => {
      if (!isStillSaving)
        this.dialogRef.close()
    })
  }
}
