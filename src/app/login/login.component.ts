import { Component, HostListener, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AppActions } from '../app.action-types';
import { loginFeedbackSelector } from '../app.selectors';
import { AppState } from '../models/app-state';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { skip, first, filter, tap } from 'rxjs/operators';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { setLoginFeedback } from '../app.actions';
import { AngularFirePerformance } from '@angular/fire/performance';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  login: FormGroup
  feedback$ = this.store.select(loginFeedbackSelector)
  constructor(
    private performance: AngularFirePerformance,
    public dialogRef: MatDialogRef<LoginComponent>,
    private store: Store<AppState>,
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public input: { action: () => any },
  ) { }

  @HostListener('document:keypress', ['$event'])
  onKeypressHandler(event: KeyboardEvent) {
    if (event.code == 'Enter')
      this.onSubmit()
  }

  ngOnDestroy(): void {
    this.store.dispatch(setLoginFeedback({ success: false, message: null }))
  }

  ngOnInit(): void {
    this.login = this.formBuilder.group({
      username: ['', Validators.required], //, Validators.email
      password: ['', Validators.required]
    })
  }

  async onSubmit() {
    if (this.login.invalid) return this.store.dispatch(
      AppActions.setLoginFeedback({
        message: "Please enter both Username and Password",
        success: false
      })
    )
    const trace = await this.performance.trace('userLogin')
    trace.start()
    this.store.dispatch(AppActions.startLoading())
    this.store.dispatch(AppActions.login({ ...this.login.value }))
    this.feedback$.pipe(
      filter(resp => !!resp),
      filter(({ error, success }) => !!success),
      first()
    ).subscribe(({ error, success }) => {
      trace.stop()
      this.input
        ? this.dialogRef.close(this.input.action())
        : this.dialogRef.close()
    })
  }

  onForgotPassword() {
    this.dialog.open(ForgotPasswordComponent, {
      width: '300px',
      data: this.login.get('username').value,
      disableClose: true,
    })
    this.dialogRef.close()
  }

}
