import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AppActions } from '../app.action-types';
import { logginInSelector } from '../app.selectors';
import { AppState } from '../models/app-state';
import { MatDialogRef } from '@angular/material/dialog';
import { skip, first, filter } from 'rxjs/operators';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  login: FormGroup
  constructor(
    public dialogRef: MatDialogRef<LoginComponent>,
    private store: Store<AppState>,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.login = this.formBuilder.group({
      username: ['', Validators.required], //, Validators.email
      password: ['', Validators.required]
    })
  }

  onSubmit() {
    if (this.login.invalid) {
      console.log("FORM INVALID")
      return
    }

    this.store.dispatch(AppActions.login({ ...this.login.value }))
    this.store.select(logginInSelector).pipe(
      skip(1),
      first(),
      filter((isSaving: boolean) => !isSaving)
    ).subscribe(isStillSaving => {
      if (!isStillSaving)
        this.dialogRef.close()
    })
  }

}
