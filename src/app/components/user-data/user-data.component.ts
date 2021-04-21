import { Component, OnInit, ChangeDetectionStrategy, Input, OnChanges, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AppActions } from 'src/app/app.action-types';
import { AppState } from 'src/app/models/app-state';
import { User } from 'src/app/models/user';
import { UserAccountActions } from 'src/app/user/user.action-types';
import { formFeedbackSelector } from 'src/app/user/user.selectors';

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
  feedback$ = this.store.select(formFeedbackSelector)
  constructor(
    private store: Store<AppState>,
    private formBuilder: FormBuilder
  ) { }

  ngOnDestroy() {
    this.store.dispatch(UserAccountActions.setFormFeedback(null))
  }

  ngOnInit(): void {
    this.userAccount = this.formBuilder.group({
      firstName: [this.user ? this.user.firstName : '', Validators.required],
      lastName: [this.user ? this.user.lastName : '', Validators.required],
      email: [this.user ? this.user.email : '', Validators.required],
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
      return this.store.dispatch(UserAccountActions.setFormFeedback({ success: false, message: 'Please complete all user information.' }))

    this.store.dispatch(AppActions.startLoading())
    const userData = { ...this.userAccount.value, id: this.user.id }
    this.store.dispatch(UserAccountActions.updateUserData({ userData }))
  }

  onCancel() {

  }

}
