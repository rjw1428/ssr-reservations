import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AngularFirestore, DocumentChangeAction } from "@angular/fire/firestore";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { from, of } from "rxjs";
import { flatMap, map, mergeMap, switchMap } from "rxjs/operators";
import { AppActions } from "../app.action-types";
import { Product } from "../models/product";
import { AngularFireDatabase, SnapshotAction } from '@angular/fire/database'
import { UserAccountActions } from "./user.action-types";
import { AppState } from "../models/app-state";
import { Store } from "@ngrx/store";
import { userSelector } from "../app.selectors";
import { Reservation } from "../models/reservation";

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
            switchMap(({ spaceId }) => this.afs.collection('products').doc(spaceId).snapshotChanges().pipe(
                map(resp => {
                    const data = resp.payload.data() as Product
                    return { ...data, id: spaceId }
                })
            )),
            map((product) => UserAccountActions.storeSpaceDetails({ product }))
        )
    )



    constructor(
        private actions$: Actions,
        private afs: AngularFirestore,
        private db: AngularFireDatabase,
        private store: Store<AppState>
    ) { }
}