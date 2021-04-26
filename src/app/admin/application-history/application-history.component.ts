import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { first, filter, switchMap, withLatestFrom, tap, map, startWith, mergeMap } from 'rxjs/operators';
import { AppActions } from 'src/app/app.action-types';
import { cachedProductListSelector, userSelector } from 'src/app/app.selectors';
import { GenericPopupComponent } from 'src/app/components/generic-popup/generic-popup.component';
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
  produts$ = this.store.select(cachedProductListSelector)
  applications$ = this.store.select(submittedApplicationsSelector)
  user$ = this.store.select(userSelector)
  filterSelection$ = this.store.select(applicationFilterSelector)
  filterOptions = { pending: "Pending", accepted: "Accepted", rejected: "Rejected" }
  selectedReservation$ = this.route.queryParams.pipe(
    startWith({ application: '' }),
    map(params => params.application)
  )
  constructor(
    private store: Store<AppState>,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {

    this.route.queryParams.pipe(
      first(),
      filter(params => !!params.filter),
      map(params => ({ value: params.filter, source: null }))
    ).subscribe(filterEvent => this.onFilterChanged(filterEvent, true))

    this.produts$.pipe(
      first(),
      filter(products => !products)
    ).subscribe(products => this.store.dispatch(AppActions.getProductTypes()))

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

  onFilterChanged(event: MatSelectChange, skipRouterParam?) {
    if (!skipRouterParam) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { filter: event.value },
      })
    }
    this.store.dispatch(AppActions.startLoading())
    this.store.dispatch(AdminActions.updatedSubmittedApplicationFilter({ filter: event.value }))
  }

  onAccept(application: Reservation) {
    this.store.dispatch(AdminActions.acceptApplication({ application }))
  }

  onReject(application: Reservation) {
    this.store.dispatch(AdminActions.rejectApplicationFeedbackForm({ application }))
  }

  onCancelLease(lease: Reservation) {
    return this.dialog.open(GenericPopupComponent, {
      width: '300px',
      data: {
        title: "Are you sure?",
        content: '<p>Are you sure you want to cancel the current lease? This action cannot be undone, and the remaining time for the space will become available again.</p>',
        actionLabel: 'Confirm',
        action: () => {
          this.store.dispatch(AppActions.startLoading())
          this.store.dispatch(AdminActions.cancelReservation({ lease }))
        }
      }
    }).afterClosed()
  }

  identify(index: number, item: Reservation) {
    return item.id
  }
}
