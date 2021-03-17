import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { noop, Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { cachedProductSelector } from 'src/app/app.selectors';
import { AppState } from 'src/app/models/app-state';
import { Product } from 'src/app/models/product';
import { Reservation } from 'src/app/models/reservation';
import { UserAccountActions } from 'src/app/user/user.action-types';
import { GenericPopupComponent } from '../generic-popup/generic-popup.component';

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
    private store: Store<AppState>,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.product$ = this.store.select(cachedProductSelector, this.reservation.spaceId)
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

  onRemove(reservation: Reservation) {
    this.dialog.open(GenericPopupComponent, {
      data: {
        title: "Are you sure?",
        content: '<p>Are you sure you want to cancel your reservation?. Click Confirm to Cancel</p>',
        action: () => this.store.dispatch(UserAccountActions.deleteReservation({ reservation }))
      }
    }).afterClosed().subscribe(callback => callback)

  }
}
