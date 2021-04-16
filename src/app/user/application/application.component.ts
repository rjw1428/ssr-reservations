import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { userSelector } from 'src/app/app.selectors';
import { AppState } from 'src/app/models/app-state';
import { User } from 'src/app/models/user';
import { UserAccountActions } from '../user.action-types';

@Component({
  selector: 'app-application',
  templateUrl: './application.component.html',
  styleUrls: ['./application.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApplicationComponent implements OnInit {
  application: FormGroup
  user$ = this.store.select(userSelector)
  constructor(
    private formBuilder: FormBuilder,
    private store: Store<AppState>
  ) { }

  ngOnInit(): void {
    this.application = this.formBuilder.group({
      companyName: ['', Validators.required],
      companyDescription: ['', Validators.required]
    })
  }

  onSave(user: User) {
    // if (this.application.invalid) return

    // const application = {
    //   ...this.application.value,
    //   userId: user.id,
    //   status: 'pending',
    //   dateCreated: new Date().getTime()
    // }

    // this.store.dispatch(UserAccountActions.submitApplication({ application }))
  }
}
