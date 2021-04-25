import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { noop, Observable } from 'rxjs';
import { filter, first, map } from 'rxjs/operators';
import { AdminActions } from 'src/app/admin/admin.action-types';
import { AppActions } from 'src/app/app.action-types';
import { cachedProductSelector, reservationDetailsSelector } from 'src/app/app.selectors';
import { AppState } from 'src/app/models/app-state';
import { Product } from 'src/app/models/product';
import { Reservation } from 'src/app/models/reservation';

@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReservationComponent implements OnInit {
  @Input() reservation: Reservation
  @Input() isHistoric: boolean = false
  @Input() isAdmin: boolean = false
  @Input() isExpanded: boolean = false
  @Output() accept = new EventEmitter()
  @Output() reject = new EventEmitter()
  @Output() remove = new EventEmitter()
  @Output() cancel = new EventEmitter()

  product$: Observable<Product>
  spaceName$: Observable<string>
  constructor(
    private store: Store<AppState>,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.product$ = this.store.select(cachedProductSelector, this.reservation.productId)
    this.spaceName$ = this.store.select(reservationDetailsSelector, this.reservation.spaceId)
    if (this.isExpanded)
      this.onExpand()
  }

  onExpand() {
    this.product$.pipe(
      first(),
      filter(product => !product)
    ).subscribe(() =>
      this.store.dispatch(AppActions.getProductTypes())
    )

    this.spaceName$.pipe(
      first(),
      filter(spaceName => !spaceName)
    ).subscribe(() =>
      this.store.dispatch(AppActions.fetchSpaceDetails({ reservation: this.reservation }))
    )
  }

  onReject() {
    this.reject.emit()
  }

  onAccept() {
    this.accept.emit()
  }

  onRemovePending() {
    this.remove.emit()
  }

  onAdminRemoveAccepted() {
    this.cancel.emit()
  }
}
