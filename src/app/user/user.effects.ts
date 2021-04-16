import { Injectable } from "@angular/core";
import { AngularFirestore, DocumentChangeAction } from "@angular/fire/firestore";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { of } from "rxjs";
import { first, flatMap, map, mergeMap, switchMap, tap } from "rxjs/operators";
import { AngularFireDatabase, SnapshotAction } from '@angular/fire/database'
import { UserAccountActions } from "./user.action-types";
import { AppState } from "../models/app-state";
import { Store } from "@ngrx/store";
import { cachedProductListSelector, userSelector } from "../app.selectors";
import { Reservation } from "../models/reservation";
import { getUsedTimes } from "../utility/constants";
import { Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";

@Injectable()
export class UserAccountEffects {

    getCurrentReservations$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UserAccountActions.getReservations),
            switchMap(() => this.store.select(userSelector)),
            switchMap((user) => {
                if (!user) return of([])
                return this.db.list(`reservations/${user.id}`).snapshotChanges()
            }),
            map((resp: SnapshotAction<Reservation>[]) => {
                if (!resp.length) return UserAccountActions.storeReservations({ reservations: null })
                const reservations = resp.map(res => ({ ...res.payload.val(), id: res.payload.key }))
                return UserAccountActions.storeReservations({ reservations })
            })
        )
    )

    getProductDetails$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UserAccountActions.fetchReservationSpaceDetails),
            switchMap(({ reservation }) => {
                // Get Matching Product Type
                return this.store.select(cachedProductListSelector).pipe(
                    first(),
                    map(products => {
                        const matchingProduct = products.find(product => product.id == reservation.productId)
                        return { reservation, product: matchingProduct }
                    })
                )
            }),
            switchMap(({ reservation, product }) => {
                //Get Space Name
                return reservation['spaceName']
                    ? of({ spaceName: reservation['spaceName'], reservation, product })
                    : this.db.object(`spaces/${reservation.productId}/${reservation.spaceId}/name`).valueChanges()
                        .pipe(map(name => ({ spaceName: name, reservation, product })))
            }),
            map(({ spaceName, reservation, product }) => UserAccountActions.storeReservationDetails({ spaceName, reservationId: reservation.id, product }))
        )
    )

    deleteReservation$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UserAccountActions.deleteReservation),
            map(({ reservation }) => {
                this.db.list(`reservations/${reservation.userId}/${reservation.id}`).remove()
                const datesToRemove = getUsedTimes(reservation.startDate, reservation.endDate)
                datesToRemove.forEach(time => this.db.list(`spaces/${reservation.productId}/${reservation.spaceId}/reserved/${time}`).remove())
            })
        ), { dispatch: false }
    )

    fetchPendingApplications$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UserAccountActions.fetchPendingApplications),
            switchMap(() => this.store.select(userSelector)),
            switchMap((user) => user
                ? this.db.list(`submitted-applications/${user.id}`).snapshotChanges().pipe(
                    map((resp: SnapshotAction<Reservation>[]) => resp.length
                        ? resp.map(res => ({ ...res.payload.val(), id: res.payload.key, user }))
                        : null
                    )
                )
                : of([])
            ),
            map(pendingApplications => UserAccountActions.storePendingApplications({ pendingApplications }))
        )
    )

    constructor(
        private actions$: Actions,
        private afs: AngularFirestore,
        private db: AngularFireDatabase,
        private store: Store<AppState>,
        public dialog: MatDialog,
        private router: Router
    ) { }
}