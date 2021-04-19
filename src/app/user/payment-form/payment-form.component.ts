import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { first, switchMap } from 'rxjs/operators';
import { paymentSourceSelector, userSelector } from 'src/app/app.selectors';
import { AddPaymentMethodComponent } from 'src/app/components/add-payment-method/add-payment-method.component';
import { GenericPopupComponent } from 'src/app/components/generic-popup/generic-popup.component';
import { AppState } from 'src/app/models/app-state';
import { UserAccountActions } from '../user.action-types';

@Component({
  selector: 'app-payment-form',
  templateUrl: './payment-form.component.html',
  styleUrls: ['./payment-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentFormComponent implements OnInit {
  paymentForm: FormGroup
  paymentSources$ = this.store.select(paymentSourceSelector)
  constructor(
    private store: Store<AppState>,
    private formBuilder: FormBuilder,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.paymentForm = this.formBuilder.group({
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
    const pipe = new CurrencyPipe('en-US')
    const formValue = this.paymentForm.value
    const payment = pipe.transform(formValue.paymentAmount)
    const additional = pipe.transform(formValue.additionalAmount ? formValue.additionalAmount : 0)
    const total = formValue.additionalAmount + formValue.paymentAmount
    const sourceId = formValue.paymentMethod

    this.dialog.open(GenericPopupComponent, {
      width: '400px',
      data: {
        title: "Confirm Payment",
        content: `<div style="display:flex; flex-direction: column; align-items: center">
                    <p><span style="font-weight: bold">Payment Amount:</span>${payment}</p>
                    <p><span style="font-weight: bold">Additional Amount:</span>${additional}</p>
                    <h3><span style="font-weight: bolder">Total:</span>${pipe.transform(total)}</h3>
                    <p>By clicking "Submit" you will be charged the selected amount, which will be paid towards your outstanding balance."
                    </div>`,
        actionLabel: 'Submit',
        action: () => this.store.dispatch(UserAccountActions.sendCharge({ sourceId, amount: +total }))
      }
    }).afterClosed().subscribe(callback => callback)
  }
}
