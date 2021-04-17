import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { Store } from '@ngrx/store';
import { first, filter, switchMap, withLatestFrom, tap } from 'rxjs/operators';
import { AppActions } from 'src/app/app.action-types';
import { userSelector } from 'src/app/app.selectors';
import { AppState } from 'src/app/models/app-state';
import { Reservation } from 'src/app/models/reservation';
import { User } from 'src/app/models/user';
import { AdminActions } from '../admin.action-types';
import { applicationFilterSelector, submittedApplicationsSelector } from '../admin.selectors';

@Component({
  selector: 'app-application-history',
  templateUrl: './application-history.component.html',
  styleUrls: ['./application-history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApplicationHistoryComponent implements OnInit {
  applications$ = this.store.select(submittedApplicationsSelector)
  user$ = this.store.select(userSelector)
  filterSelection$ = this.store.select(applicationFilterSelector)
  filterOptions = { pending: "Pending", accepted: "Accepted", rejected: "Rejected" }
  constructor(
    private store: Store<AppState>
  ) { }

  ngOnInit(): void {
    this.store.dispatch(AppActions.getProductTypes())
    this.applications$.pipe(
      first(),
      withLatestFrom(this.filterSelection$),
      filter(([apps, filter]) => !apps.length),
    ).subscribe(([apps, filter]) => this.store.dispatch(AdminActions.fetchSubmittedApplications({ filter })))
  }


  showAdminButtons(user: User): boolean {
    if (!user) return false
    const rolesWithAccess = ['admin', 'master']
    return rolesWithAccess.includes(user.role)
  }

  onFilterChanged(event: MatSelectChange) {
    this.store.dispatch(AdminActions.updatedSubmittedApplicationFilter({ filter: event.value }))
  }

  onAccept(application: Reservation) {
    this.store.dispatch(AdminActions.acceptApplication({ application }))
  }

  onReject(application: Reservation) {
    this.store.dispatch(AdminActions.rejectApplicationFeedbackForm({ application }))
  }
}
