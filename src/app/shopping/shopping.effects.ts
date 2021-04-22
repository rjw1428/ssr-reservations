import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { first, flatMap, map, mergeMap, switchMap, tap } from "rxjs/operators";
import { AppActions } from "../app.action-types";
import { Product } from "../models/product";
import { ShoppingActions } from "./shopping.action-types";
import { AngularFireDatabase } from '@angular/fire/database'
import { Space } from "../models/space";
import { getUsedTimes } from "../utility/utility";
import { GenericPopupComponent } from "../components/generic-popup/generic-popup.component";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
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
            switchMap(({ reservation }) => {
                const { user, ...application } = reservation
                return this.db.database.ref(`pending-applications/${application.userId}`)
                    .push(application)
                    .then(resp => ({ ...reservation, id: resp.key }))
            }),
            tap(() => this.dialog.open(GenericPopupComponent, {
                width: '400px',
                data: {
                    title: 'Application submitted...',
                    content:
                        `<p>
                        An application has been submitted for review. Please allow a few days to 
                        for the application to be reviewed. You will receive an email once the review procees is completed.
                        You can also check the status of your application or make updates on the next page.
                        </p>`,
                    actionLabel: 'Okay',
                    action: () => this.router.navigate(['/user', 'application-status'])
                }
            })),
            tap(reservation => this.afs.collection('mail').add({
                to: reservation.user.email,
                template: {
                    name: 'applicationSubmitted',
                    data: {
                        applicationId: reservation.id,
                        username: `${reservation.user.firstName} ${reservation.user.lastName}`
                    }
                }
            })),
            map(reservation => ShoppingActions.saveReservationComplete())
        )
    )

    queryAvailability$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ShoppingActions.queryAvailability),
            switchMap(({ startDate, endDate, productId }) => this.db.list(`spaces/${productId}`).snapshotChanges().pipe(
                first(),
                map(resp => {
                    const spaces = resp.map(space => {
                        const data = space.payload.val() as Space
                        return { id: space.key, ...data }
                    })
                    return ({ spaces, startDate, endDate })
                })
            )),
            map((resp: { spaces: Space[], startDate: number, endDate: number }) => {
                const filteredSpaces = resp.spaces
                    .filter(space => {
                        if (!space.reserved) return true
                        const requestedTimes = getUsedTimes(resp.startDate, resp.endDate)
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
        private db: AngularFireDatabase,
        public dialog: MatDialog,
        private router: Router
    ) { }
}
