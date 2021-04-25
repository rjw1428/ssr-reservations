import { Component, OnInit, ChangeDetectionStrategy, Input, OnChanges, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { AppActions } from 'src/app/app.action-types';
import { loginFeedbackSelector } from 'src/app/app.selectors';
import { AppState } from 'src/app/models/app-state';
import { User } from 'src/app/models/user';
import { UserAccountActions } from 'src/app/user/user.action-types';

@Component({
  selector: 'app-user-data',
  templateUrl: './user-data.component.html',
  styleUrls: ['./user-data.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserDataComponent implements OnInit, OnChanges, OnDestroy {
  userAccount: FormGroup
  @Input() user: User
  @Input() editable = false
  @Input() tirggerEmit: boolean
  @Output() value = new EventEmitter<{ error: string, resp: {} }>()
  feedback$ = this.store.select(loginFeedbackSelector)
  constructor(
    private store: Store<AppState>,
    private formBuilder: FormBuilder
  ) { }

  ngOnDestroy() {
    this.store.dispatch(AppActions.setLoginFeedback(null))
  }

  ngOnInit(): void {
    this.userAccount = this.formBuilder.group({
      firstName: [this.user ? this.user.firstName : '', Validators.required],
      lastName: [this.user ? this.user.lastName : '', Validators.required],
      email: [{value: this.user ? this.user.email : '', disabled: !!this.user}, [Validators.required, Validators.email]],
    })
  }

  // IF TRIGGER EMIT IS TRUE, OUTPUT VALUE
  ngOnChanges(): void {
    if (this.tirggerEmit) {
      const event = this.userAccount.invalid
        ? {
          error: "Data missing from User Information",
          resp: null
        }
        : {
          error: null,
          resp: this.userAccount.value
        }
      this.value.emit(event)
    }
  }

  onSave() {
    if (this.userAccount.invalid)
      return this.store.dispatch(AppActions.setLoginFeedback({ success: false, message: 'Please complete all user information.' }))

    this.store.dispatch(AppActions.startLoading())
    const userData = { ...this.userAccount.value, id: this.user.id }
    this.store.dispatch(UserAccountActions.updateUserData({ userData }))
  }

  onCancel() {

  }

}
