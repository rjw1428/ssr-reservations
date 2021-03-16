import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AppState } from 'src/app/models/app-state';
import { Product } from 'src/app/models/product';
import { Reservation } from 'src/app/models/reservation';
import { UserAccountActions } from '../user.action-types';
import { userCurrentReservationsSelector, userHistoricReservationsSelector } from '../user.selectors';

@Component({
  selector: 'app-reservations-list',
  templateUrl: './reservation-list.component.html',
  styleUrls: ['./reservation-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReservationListComponent implements OnInit {
  reservations$: Observable<Reservation[]>
  isHistoric = false
  constructor(
    private route: ActivatedRoute,
    private store: Store<AppState>
  ) { }

  ngOnInit(): void {
    this.store.dispatch(UserAccountActions.getReservations())

    this.reservations$ = this.route.params.pipe(
      switchMap(params => {
        if (params['type'] == 'current') {
          this.isHistoric = false
          return this.store.select(userCurrentReservationsSelector)
        }
        if (params['type'] == 'historic') {
          this.isHistoric = true
          return this.store.select(userHistoricReservationsSelector)
        }
      }));
  }

  identify(index: number, item: Product) {
    return item.id
  }

}
