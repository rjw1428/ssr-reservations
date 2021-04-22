import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatAccordion } from '@angular/material/expansion';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, first, map, switchMap } from 'rxjs/operators';
import { AppActions } from 'src/app/app.action-types';
import { cachedProductListSelector } from 'src/app/app.selectors';
import { GenericPopupComponent } from 'src/app/components/generic-popup/generic-popup.component';
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
  @ViewChild(MatAccordion) accordion: MatAccordion;
  constructor(
    private route: ActivatedRoute,
    private store: Store<AppState>,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.store.dispatch(UserAccountActions.getReservations())

    this.store.select(cachedProductListSelector).pipe(
      first(),
      filter(product => !product.length)
    ).subscribe(() => this.store.dispatch(AppActions.getProductTypes()))

    this.reservations$ = this.route.params.pipe(
      switchMap(params => {
        if (params['type'] == 'current') {
          this.isHistoric = false
          return this.store.select(userCurrentReservationsSelector)
        }
        if (params['type'] == 'history') {
          this.isHistoric = true
          return this.store.select(userHistoricReservationsSelector)
        }
      }));
  }

  onRemove(reservation: Reservation) {
    this.dialog.open(GenericPopupComponent, {
      data: {
        title: "Are you sure?",
        content: '<p>Are you sure you want to cancel your reservation?. Click Confirm to Cancel</p>',
        actionLabel: 'Confirm',
        action: () => this.store.dispatch(UserAccountActions.deleteReservation({ reservation, status: 'accepted' }))
      }
    })
  }

  openAll() {
    if (this.accordion)
      this.accordion.openAll()
  }

  closeAll() {
    if (this.accordion)
      this.accordion.closeAll()
  }

  identify(index: number, item: Product) {
    return item.id
  }

}
