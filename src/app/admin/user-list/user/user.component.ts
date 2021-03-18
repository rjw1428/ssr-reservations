import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { first, filter } from 'rxjs/operators';
import { AppState } from 'src/app/models/app-state';
import { Reservation } from 'src/app/models/reservation';
import { User } from 'src/app/models/user';
import { AdminActions } from '../../admin.action-types';
import { userNextReservationsSelector, userPreviousReservationsSelector, userReservationsSelector } from '../../admin.selectors';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserComponent implements OnInit {
  @Input() user: User
  @Output() promote = new EventEmitter<string>()
  @Output() demote = new EventEmitter<string>()
  constructor(
    private store: Store<AppState>,
  ) { }

  ngOnInit(): void {
  }

  getNextReservations(user: User): Observable<Reservation[]> {
    return this.store.select(userNextReservationsSelector, user.id)
  }

  getPreviousReservation(user: User): Observable<Reservation> {
    return this.store.select(userPreviousReservationsSelector, user.id)
  }

  openReservation(reservation: Reservation) {
    this.store.dispatch(AdminActions.getFullReservationDataFromList({ reservation }))
  }
  
  onExpand(user: User) {
    this.store.select(userReservationsSelector, user.id).pipe(
      first(),
      filter(res => !res.length)
    ).subscribe(() => this.store.dispatch(AdminActions.getUserReservation({ userId: user.id })))
  }

  onPromote() {
    this.promote.emit(this.user.id)
  }

  onDemote() {
    this.demote.emit(this.user.id)
  }
}
