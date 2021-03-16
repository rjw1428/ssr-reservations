import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { noop, Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { AppState } from 'src/app/models/app-state';
import { Product } from 'src/app/models/product';
import { Reservation } from 'src/app/models/reservation';
import { UserAccountActions } from 'src/app/user/user.action-types';
import { expandedProductSelector } from 'src/app/user/user.selectors';

@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReservationComponent implements OnInit {
  @Input() reservation: Reservation
  @Input() isHistoric: boolean = false

  product$: Observable<Product>
  constructor(
    private store: Store<AppState>
  ) { }

  ngOnInit(): void {
    this.product$ = this.store.select(expandedProductSelector, this.reservation.spaceId)
  }

  onExpand() {
    this.product$.pipe(
      first(),
      map(product => {
        if (!product)
          this.store.dispatch(UserAccountActions.fetchReservationSpaceDetails({ spaceId: this.reservation.spaceId }))
      })
    ).subscribe(noop)
  }

  onRemove() {

  }
}
