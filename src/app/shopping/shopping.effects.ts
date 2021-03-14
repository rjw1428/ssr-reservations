import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AngularFirestore, DocumentChangeAction } from "@angular/fire/firestore";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { from, of } from "rxjs";
import { flatMap, map, mergeMap, switchMap } from "rxjs/operators";
import { AppActions } from "../app.action-types";
import { Product } from "../models/product";
import { ShoppingActions } from "./shopping.action-types";
import { AngularFireDatabase } from '@angular/fire/database'

@Injectable()
export class ShoppingEffects {

    getProducts$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ShoppingActions.getPoductList),
            switchMap(() => this.afs.collection('products').snapshotChanges()),
            map((docs: DocumentChangeAction<Product>[]) => {
                return docs
                    .reduce((obj, doc) => {
                        const id = doc.payload.doc.id
                        const data = { id, ...doc.payload.doc.data() }
                        return { ...obj, [id]: data }
                    }, {})
            }),
            map(products => ShoppingActions.storePoductList({ products }))
        )
    )

    saveProducts$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ShoppingActions.saveReservation),
            switchMap(({ reservation }) => this.db.database.ref(`users/${reservation.userId}/reservations`).push(reservation)),
            flatMap((resp) => {
                console.log(resp)
                return resp
                    ? [
                        AppActions.stopLoading(),
                        ShoppingActions.saveReservationComplete()
                    ]
                    : [AppActions.stopLoading()]
            })
        )
    )


    constructor(
        private actions$: Actions,
        private afs: AngularFirestore,
        private db: AngularFireDatabase
    ) { }
}