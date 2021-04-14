import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';
import { filter, first } from 'rxjs/operators';
import { AppState } from 'src/app/models/app-state';
import { UserAccountActions } from '../user.action-types';
import { userPendingApplicationsSelector } from '../user.selectors';

@Component({
  selector: 'app-application-status',
  templateUrl: './application-status.component.html',
  styleUrls: ['./application-status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApplicationStatusComponent implements OnInit {
  pendingApplications$ = this.store.select(userPendingApplicationsSelector)
  constructor(
    private store: Store<AppState>
  ) { }

  ngOnInit(): void {
    this.pendingApplications$.pipe(
      first(),
      filter(application => !application.length)
    ).subscribe(() => this.store.dispatch(UserAccountActions.fetchPendingApplications()))
  }

}
