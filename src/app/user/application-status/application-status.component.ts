import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { filter, first } from 'rxjs/operators';
import { AppActions } from 'src/app/app.action-types';
import { cachedProductListSelector } from 'src/app/app.selectors';
import { GenericPopupComponent } from 'src/app/components/generic-popup/generic-popup.component';
import { AppState } from 'src/app/models/app-state';
import { Reservation } from 'src/app/models/reservation';
import { UserAccountActions } from '../user.action-types';
import { userPendingApplicationsSelector, userRejectedApplicationsSelector } from '../user.selectors';

@Component({
  selector: 'app-application-status',
  templateUrl: './application-status.component.html',
  styleUrls: ['./application-status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApplicationStatusComponent implements OnInit {
  pendingApplications$ = this.store.select(userPendingApplicationsSelector)
  rejectedApplications$ = this.store.select(userRejectedApplicationsSelector)
  constructor(
    private store: Store<AppState>,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.store.select(cachedProductListSelector).pipe(
      first(),
      filter(product => !product.length)
    ).subscribe(() => this.store.dispatch(AppActions.getProductTypes()))

    this.pendingApplications$.pipe(
      first(),
      filter(application => !application.length)
    ).subscribe(() => this.store.dispatch(UserAccountActions.fetchPendingApplications()))

    this.rejectedApplications$.pipe(
      first(),
      filter(application => !application.length)
    ).subscribe(() => this.store.dispatch(UserAccountActions.fetchRejectedApplications()))
  }

  onRemove(reservation: Reservation) {
    this.dialog.open(GenericPopupComponent, {
      data: {
        title: "Are you sure?",
        content: '<p>Are you sure you want to cancel your application?. Click Confirm to Cancel</p>',
        actionLabel: 'Confirm',
        action: () => this.store.dispatch(UserAccountActions.deleteReservation({ reservation, status: 'pending' }))
      }
    })
  }

  identify(index: number, item: Reservation) {
    return item.id
  }
}
