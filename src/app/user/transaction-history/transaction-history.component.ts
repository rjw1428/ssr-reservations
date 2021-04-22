import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { catchError, filter, first } from 'rxjs/operators';
import { userSelector } from 'src/app/app.selectors';
import { AppState } from 'src/app/models/app-state';
import { UserAccountActions } from 'src/app/user/user.action-types';
import { userTransactionSelector } from 'src/app/user/user.selectors';

@Component({
  selector: 'app-transaction-history',
  templateUrl: './transaction-history.component.html',
  styleUrls: ['./transaction-history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionHistoryComponent implements OnInit {
  user$ = this.store.select(userSelector)
  transactions$ = this.store.select(userTransactionSelector)
  displayedColumns = {
    dateCreated: 'Date',
    reservationId: 'Reservation ID',
    spaceName: 'Space',
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
    ).subscribe(() => this.store.dispatch(UserAccountActions.fetchUserTransactions()))
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

