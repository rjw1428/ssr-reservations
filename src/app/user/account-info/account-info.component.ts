import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { first, map, shareReplay } from 'rxjs/operators';
import { AppActions } from 'src/app/app.action-types';
import { paymentSourceSelector, userSelector } from 'src/app/app.selectors';
import { AddPaymentMethodComponent } from 'src/app/components/add-payment-method/add-payment-method.component';
import { GenericPopupComponent } from 'src/app/components/generic-popup/generic-popup.component';
import { AppState } from 'src/app/models/app-state';
import { User } from 'src/app/models/user';
import { UserAccountActions } from '../user.action-types';

@Component({
  selector: 'app-account-info',
  templateUrl: './account-info.component.html',
  styleUrls: ['./account-info.component.scss']
})
export class AccountInfoComponent implements OnInit, OnDestroy {
  user$ = this.store.select(userSelector)
  paymentSources$ = this.store.select(paymentSourceSelector)
  paymentForm: FormGroup
  autoSetDefaultPaymentSub: Subscription
  constructor(
    private store: Store<AppState>,
    private formBuilder: FormBuilder,
    private dialog: MatDialog
  ) { }

  ngOnDestroy() {
    if (this.autoSetDefaultPaymentSub)
      this.autoSetDefaultPaymentSub.unsubscribe()
  }

  ngOnInit(): void {
    this.autoSetDefaultPaymentSub = this.user$.pipe(shareReplay()).subscribe(user => {
      this.paymentForm = this.formBuilder.group({
        selectedSource: [user ? user.defaultPaymentSource : '', Validators.required]
      })
    })
  }


  onSetDefault() {
    if (this.paymentForm.invalid) return
    const defaultPaymentSource = this.paymentForm.get('selectedSource').value
    this.store.dispatch(UserAccountActions.setDefaultPaymentSource({ defaultPaymentSource }))
  }

  onRemove(user: User) {
    if (this.paymentForm.invalid) return

    const paymentSourceId = this.paymentForm.get('selectedSource').value
    const updatedSource = Object.values(user.paymentSources)
      .filter(source => source.id != paymentSourceId)
      .map(source => ({ [source.id]: source }))
      .reduce((acc, cur) => ({ ...acc, ...cur }), {})

    const userData = { ...user, paymentSources: updatedSource }
    this.dialog.open(GenericPopupComponent, {
      data: {
        title: "Are you sure...",
        content: `Are you sure you want to remove this card?`,
        actionLabel: "Remove",
        action: () => {
          this.paymentForm.reset()
          this.store.dispatch(UserAccountActions.updateUserData({ userData }))
        }
      }
    })
  }

  onAddCard() {
    this.dialog.open(AddPaymentMethodComponent, {
      data: null,
      disableClose: true
    })
  }
}
