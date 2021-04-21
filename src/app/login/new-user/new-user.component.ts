import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AppActions } from 'src/app/app.action-types';
import { loginFeedbackSelector } from 'src/app/app.selectors';
import { AppState } from 'src/app/models/app-state';

@Component({
  selector: 'app-new-user',
  templateUrl: './new-user.component.html',
  styleUrls: ['./new-user.component.scss']
})
export class NewUserComponent implements OnInit {
  createAccount: FormGroup
  feedback$ = this.store.select(loginFeedbackSelector)
  constructor(
    private store: Store<AppState>,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.createAccount = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', Validators.required],
      passwordConfirm: ['', Validators.required]
    })

  }

  onSave() {
    if (this.createAccount.invalid) return
    if (this.createAccount.get('password').value != this.createAccount.get('passwordConfirm').value) return
    this.store.dispatch(AppActions.startLoading())
    const { passwordConfirm, ...userInfo } = this.createAccount.value
    const user = {
      ...userInfo,
      dateCreated: new Date().getTime(),
      role: 'user'
    }
    this.store.dispatch(AppActions.createUser({ user }))
  }

}
