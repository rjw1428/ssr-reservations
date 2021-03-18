import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AngularFirestore, DocumentChangeAction } from "@angular/fire/firestore";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { from, of } from "rxjs";
import { first, flatMap, map, mergeMap, switchMap, tap } from "rxjs/operators";
import { AppActions } from "../app.action-types";
import { Product } from "../models/product";
import { AngularFireDatabase, SnapshotAction } from '@angular/fire/database'
import { UserAccountActions } from "./user.action-types";
import { AppState } from "../models/app-state";
import { Store } from "@ngrx/store";
import { cachedProductListSelector, userSelector } from "../app.selectors";
import { Reservation } from "../models/reservation";
import { getUsedTimes } from "../utility/constants";

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
            switchMap(({ reservation }) => this.store.select(userSelector).pipe(
                first(),
                map(user => {
                    this.db.list(`reservations/${user.id}/${reservation.id}`).remove()
                    const datesToRemove = getUsedTimes(reservation.startTime, reservation.endTime)
                    datesToRemove.forEach(time => this.db.list(`spaces/${reservation.productId}/${reservation.spaceId}/reserved/${time}`).remove())
                })
            ))
        ), { dispatch: false }
    )


    constructor(
        private actions$: Actions,
        private afs: AngularFirestore,
        private db: AngularFireDatabase,
        private store: Store<AppState>
    ) { }
}