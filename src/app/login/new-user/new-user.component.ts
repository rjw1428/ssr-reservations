import { ChangeDetectionStrategy, Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AppActions } from 'src/app/app.action-types';
import { loginFeedbackSelector } from 'src/app/app.selectors';
import { AppState } from 'src/app/models/app-state';

@Component({
  selector: 'app-new-user',
  templateUrl: './new-user.component.html',
  styleUrls: ['./new-user.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewUserComponent implements OnInit {
  createAccount: FormGroup
  feedback$ = this.store.select(loginFeedbackSelector)
  triggerEmit = false
  constructor(
    private store: Store<AppState>,
    private formBuilder: FormBuilder
  ) { }

  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key == 'Enter' && this.createAccount && this.createAccount.valid)
      this.onSave()
  }

  ngOnInit(): void {
    this.createAccount = this.formBuilder.group({
      password: ['', Validators.required],
      passwordConfirm: ['', Validators.required]
    })

  }

  onSave() {
    // GET USER DATA FORM
    this.triggerEmit = true
  }

  onResponse({ error, resp }) {
    const passwordsDontMatch = this.createAccount.get('password').value != this.createAccount.get('passwordConfirm').value
    if (this.createAccount.invalid || error || passwordsDontMatch)
      this.triggerEmit = false
    if (this.createAccount.invalid)
      return this.store.dispatch(AppActions.setLoginFeedback({ success: false, message: "Please fill out both 'Password' and 'Confirm Password' fields" }))
    if (error)
      return this.store.dispatch(AppActions.setLoginFeedback({ success: false, message: error }))
    if (passwordsDontMatch)
      return this.store.dispatch(AppActions.setLoginFeedback({ success: false, message: "Passwords did not match, try again." }))

    this.store.dispatch(AppActions.startLoading())
    const { passwordConfirm, password } = this.createAccount.value
    const user = {
      ...resp,
      password,
      dateCreated: new Date().getTime(),
      role: 'user'
    }
    this.store.dispatch(AppActions.createUser({ user }))
  }

}
