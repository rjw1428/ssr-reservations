import { Injectable } from "@angular/core";
import { AngularFirestore, DocumentChangeAction } from "@angular/fire/firestore";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { of } from "rxjs";
import { filter, first, flatMap, map, mergeMap, switchMap, tap, withLatestFrom } from "rxjs/operators";
import { AngularFireDatabase, SnapshotAction } from '@angular/fire/database'
import { UserAccountActions } from "./user.action-types";
import { AppState } from "../models/app-state";
import { Store } from "@ngrx/store";
import { cachedProductListSelector, userSelector } from "../app.selectors";
import { Reservation } from "../models/reservation";
import { getUsedTimes, isOverlapingTime } from "../utility/constants";
import { Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { AngularFireFunctions } from "@angular/fire/functions";
import { User } from "../models/user";
import { AppActions } from "../app.action-types";

@Injectable()
export class UserAccountEffects {

    getCurrentReservations$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UserAccountActions.getReservations),
            switchMap(() => this.store.select(userSelector)),
            filter(user => !!user),
            switchMap((user) => this.db.list(`accepted-applications/${user.id}`).snapshotChanges()),
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
                return { reservation, status }
            }),
            switchMap(({ reservation, status }) => {
                // Search Pending Applications for duplicates
                return status == 'accepted'
                    ? this.db.list(`pending-applications`).snapshotChanges().pipe(
                        first(),
                        map((resp: SnapshotAction<{ [appId: string]: Reservation }>[]) => {
                            return resp.reduce((agg, doc) => {
                                const payload = doc.payload.val()
                                const userApps = Object.keys(payload).map(id => ({ ...payload[id], id }))
                                return userApps.length
                                    ? agg.concat(userApps.filter(res =>
                                        res.spaceId == reservation.spaceId
                                        && isOverlapingTime(reservation.startDate, reservation.endDate, res.startDate, res.endDate)))
                                    : agg
                            }, [] as Reservation[])
                        })
                    )
                    : of([])
            }),
            map(noLongerOverlappignReservations => noLongerOverlappignReservations.map(application =>
                this.db.object(`pending-applications/${application.userId}/${application.id}`).update({ isAlreadyBooked: false })
            ))
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

    addCardToStripe$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UserAccountActions.addCreditCardToStripe),
            withLatestFrom(this.store.select(userSelector)),
            switchMap(([{ token }, user]: [any, User]) => {
                const createCard = this.fns.httpsCallable('createStripeSource')
                return createCard({ stripeId: user.stripeCustomerId, token, userId: user.id })
            }),
            map(({ err, resp }) => {
                if (err) {
                    console.log(err)
                    throw "Unable to create stripe payment source"
                }
                console.log(resp)
                // THIS DOESNT ACTUALLY GET THE ERROR/RESPONSE TO THE STATE/COMPONENT
                // return UserAccountActions.creditCardAddResponse({ response: { err, resp } })
                return AppActions.stopLoading()
            })
        )
    )

    addCharge$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UserAccountActions.sendCharge),
            withLatestFrom(this.store.select(userSelector)),
            switchMap(([{ sourceId, amount, reservationId, selectedTime, spaceId, productId }, user]: [any, User]) => {
                const createCharge = this.fns.httpsCallable('createStripeCharge')
                return createCharge({
                    userId: user.id,
                    customerId: user.stripeCustomerId,
                    sourceId,
                    amount,
                    reservationId,
                    selectedTime,
                    spaceId,
                    productId
                })
            }),
            map(({ err, resp }) => {
                if (err) {
                    console.log(err)
                    throw "Unable to create stripe payment source"
                }
                console.log(resp)
                // THIS DOESNT ACTUALLY GET THE ERROR/RESPONSE TO THE STATE/COMPONENT
                return AppActions.stopLoading()
            })
        )
    )

    constructor(
        private actions$: Actions,
        private afs: AngularFirestore,
        private db: AngularFireDatabase,
        private fns: AngularFireFunctions,
        private store: Store<AppState>,
        public dialog: MatDialog,
        private router: Router
    ) { }
}