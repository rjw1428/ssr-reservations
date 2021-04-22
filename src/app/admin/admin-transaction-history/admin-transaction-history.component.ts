import { Component, OnInit, ChangeDetectionStrategy, AfterViewInit, ViewChild, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';

import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { catchError, filter, first, switchMap } from 'rxjs/operators';
import { AdminActions } from 'src/app/admin/admin.action-types';
import { adminAllTransactionsSelector, userListSelector } from 'src/app/admin/admin.selectors';
import { userSelector } from 'src/app/app.selectors';
import { AppState } from 'src/app/models/app-state';

@Component({
  selector: 'app-admin-transaction-history',
  templateUrl: './admin-transaction-history.component.html',
  styleUrls: ['./admin-transaction-history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminTransactionHistoryComponent implements OnInit {
  user$ = this.store.select(userSelector)
  transactions$ = this.store.select(adminAllTransactionsSelector)
  displayedColumns = {
    dateCreated: 'Date',
    reservationId: 'Reservation ID',
    spaceName: 'Space',
    userId: 'User',
    dateDue: 'Date Due',
    amount: "Amount"
  };

  constructor(
    private store: Store<AppState>,
  ) { }

  ngOnInit(): void {
    this.transactions$.pipe(
      first(),
      filter(transactions => !transactions.length)
    ).subscribe(() => this.store.dispatch(AdminActions.fetchTransactions()))

    this.store.select(userListSelector).pipe(
      first(),
      filter(users => !users.length)
    ).subscribe(() => {
      this.store.dispatch(AdminActions.getUserList())
    })
  }

  openReservation(reservationId: string) {
    console.log(reservationId)
  }

  applyFilter(event) {
    const filterValue = (event.target as HTMLInputElement).value;
    console.log(filterValue)
    // this.dataSource.filter = filterValue.trim().toLowerCase();
  }

}

