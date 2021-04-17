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
                return this.db.list(`accepted-applications/${user.id}`).snapshotChanges()
            }),
            map((resp: SnapshotAction<Reservation>[]) => {
                if (!resp.length) return UserAccountActions.storeReservations({ reservations: null })
                const reservations = resp.map(res => ({ ...res.payload.val(), id: res.payload.key }))
                return UserAccountActions.storeReservations({ reservations })
            })
        )
    )

    deleteReservation$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UserAccountActions.deleteReservation),
            map(({ reservation, status }) => {
                this.db.list(`${status}-applications/${reservation.userId}/${reservation.id}`).remove()
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
                ? this.db.list(`pending-applications/${user.id}`).snapshotChanges().pipe(
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

    fetchRejectedApplications$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UserAccountActions.fetchRejectedApplications),
            switchMap(() => this.store.select(userSelector)),
            switchMap((user) => user
                ? this.db.list(`rejected-applications/${user.id}`).snapshotChanges().pipe(
                    map((resp: SnapshotAction<Reservation>[]) => resp.length
                        ? resp.map(res => ({ ...res.payload.val(), id: res.payload.key, user }))
                        : null
                    )
                )
                : of([])
            ),
            map(rejectedApplications => UserAccountActions.storeRejectedApplications({ rejectedApplications }))
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