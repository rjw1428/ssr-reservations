import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { AppActions } from 'src/app/app.action-types';
import { AppState } from 'src/app/models/app-state';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  resetPassword: FormGroup
  constructor(
    public dialogRef: MatDialogRef<ForgotPasswordComponent>,
    @Inject(MAT_DIALOG_DATA) public previousFormEmail: string,
    private store: Store<AppState>,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.resetPassword = this.formBuilder.group({
      email: [this.previousFormEmail ? this.previousFormEmail : '', Validators.required]
    })
  }

  onReset() {
    if (this.resetPassword.invalid) {
      console.log("FORM INVALID")
      return
    }
    const email = this.resetPassword.get('email').value
    this.store.dispatch(AppActions.resetPassword({ email }))
    this.dialogRef.close()
  }
}
