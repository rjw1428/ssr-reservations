import { trigger, state, style, transition, animate } from '@angular/animations';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, Observable, of, zip } from 'rxjs';
import { filter, first, map, shareReplay, withLatestFrom } from 'rxjs/operators';
import { cachedProductListSelector, cachedProductSelector, deactiveProductIdsSelector } from 'src/app/app.selectors';
import { AppState } from 'src/app/models/app-state';
import { Product } from 'src/app/models/product';
import { User } from 'src/app/models/user';
import { AdminActions } from '../admin.action-types';
import { adminSummarySelector, userListSelector, userSelector } from '../admin.selectors';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class SummaryComponent implements OnInit {
  /* 
    Remove Deactive rooms from summary with no reservations,
    If the room is deactiveated but has reservations remaining,
    then show it on the summary
  */
  adminSummary$ = zip(
    this.store.select(adminSummarySelector),
    this.store.select(deactiveProductIdsSelector)
  ).pipe(
    map(([summary, deactiveProductTypeIds]) => 
      summary
        ? Object.keys(summary)
          .map(key => {
            const productSummary = summary[key]
            const isDeactive = deactiveProductTypeIds.includes(key)
            const reducedRooms = isDeactive
              ? Object.keys(productSummary)
                .map(key => ({ ...productSummary[key], id: key }))
                .filter((productDetails: { name: string, productId: string, reserved: any, id: string }) => !!productDetails.reserved)
                .reduce((acc, cur) => ({ ...acc, [cur.id]: cur }), {})
              : summary[key]

            return { [key]: reducedRooms }
          })
          .reduce((acc, cur) => ({ ...acc, ...cur }), {})
        : null
    )
  )
  productList$ = this.store.select(cachedProductListSelector)
  users$ = this.store.select(userListSelector)
  constructor(
    private store: Store<AppState>
  ) { }

  ngOnInit(): void {
    this.users$.pipe(
      first(),
      filter(users => !users.length)
    ).subscribe(() => this.store.dispatch(AdminActions.getUserList()))

    this.productList$.pipe(
      first(),
      filter(productList => !productList.length)
    ).subscribe(() => this.store.dispatch(AdminActions.getPoductList()))

    this.adminSummary$.pipe(
      first(),
      filter(summary => !summary)
    ).subscribe(() => this.store.dispatch(AdminActions.getAdminSummary()))
  }

  getUserFromId(userId: string): Observable<User> {
    return this.store.select(userSelector, userId)
  }

  getProductFromId(productId: string): Observable<Product> {
    return this.store.select(cachedProductSelector, productId)
  }

  onOpenReservation(reservationId: string, productId: string, userId: string, spaceName: string) {
    this.store.dispatch(AdminActions.getFullReservationDataFromSummary({ reservationId, productId, userId, spaceName }))
  }

  onEditSpaceName(productId, spaceId, currentName) {
    this.store.dispatch(AdminActions.udateSpaceName({ productId, spaceId, currentName }))
  }
}
