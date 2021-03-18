import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { first, flatMap, map, mergeMap, switchMap, tap } from "rxjs/operators";
import { AppActions } from "../app.action-types";
import { Product } from "../models/product";
import { ShoppingActions } from "./shopping.action-types";
import { AngularFireDatabase } from '@angular/fire/database'
import { Space } from "../models/space";
import { getUsedTimes } from "../utility/constants";
@Injectable()
export class ShoppingEffects {

    getProducts$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ShoppingActions.getPoductList),
            switchMap(() => this.afs.collection('products').valueChanges()),
            map((products: Product[]) =>
                products.reduce((obj, product) => ({ ...obj, [product.id]: product }), {})
            ),
            map((products: { [productId: string]: Product }) =>
                AppActions.storeProductsList({ products })
            )
        )
    )

    saveReservation$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ShoppingActions.saveReservation),
            switchMap(async ({ reservation, productId }) => {
                const usedTimes = getUsedTimes(reservation.startTime, reservation.endTime)
                const resp = await this.db.database.ref(`reservations/${reservation.userId}`).push(reservation)
                const payload = usedTimes
                    .map(time => ({
                        [time]: {
                            user: reservation.userId,
                            reservation: resp.key
                        }
                    }))
                    .reduce((acc, cur) => ({ ...acc, ...cur }))
                return this.db.database.ref(`spaces/${productId}/${reservation.spaceId}/reserved`).update(payload)
            }),
            map((resp) => ShoppingActions.saveReservationComplete()),
            tap(() => AppActions.stopLoading())
        )
    )

    queryAvailability$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ShoppingActions.queryAvailability),
            switchMap(({ startTime, endTime, productId }) => this.db.list(`spaces/${productId}`).snapshotChanges().pipe(
                first(),
                map(resp => {
                    const spaces = resp.map(space => {
                        const data = space.payload.val() as Space
                        return { id: space.key, ...data }
                    })
                    return ({ spaces, startTime, endTime })
                })
            )),
            map((resp: { spaces: Space[], startTime: number, endTime: number }) => {
                const filteredSpaces = resp.spaces.filter(space => {
                    if (!space.reserved) return true
                    const requestedTimes = getUsedTimes(resp.startTime, resp.endTime)
                    const bookedTimes = Object.keys(space.reserved).map(time => +time)
                    const overlap = requestedTimes.reduce((overlap, time) => overlap + +bookedTimes.includes(time), 0)
                    return overlap < 1
                })
                return ShoppingActions.saveAvailableSpaces({ spaces: filteredSpaces })
            })
        )
    )


    constructor(
        private actions$: Actions,
        private afs: AngularFirestore,
        private db: AngularFireDatabase
    ) { }
}
