import { Injectable } from "@angular/core";
import { AngularFirestore, DocumentChangeAction } from "@angular/fire/firestore";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { of } from "rxjs";
import { filter, first, flatMap, map, switchMap, takeWhile, tap, withLatestFrom } from "rxjs/operators";
import { AngularFireDatabase, SnapshotAction } from '@angular/fire/database'
import { UserAccountActions } from "./user.action-types";
import { AppState } from "../models/app-state";
import { Store } from "@ngrx/store";
import { userSelector } from "../app.selectors";
import { Reservation } from "../models/reservation";
import { getUsedTimes, isOverlapingTime } from "../utility/utility";
import { Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { AngularFireFunctions } from "@angular/fire/functions";
import { User } from "../models/user";
import { AppActions } from "../app.action-types";
import { Transaction } from "../models/transaction";

@Injectable()
export class UserAccountEffects {

    // USE THIS WHEN YOU ONLY WANT THE USER ID
    currentUserId$ = this.store.select(userSelector).pipe(
        filter(user => !!user),
        first(),
        map(user => user.id)
    )

    getCurrentReservations$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UserAccountActions.getReservations),
            switchMap(() => this.currentUserId$),
            switchMap((userId) => this.db.list(`accepted-applications/${userId}`).snapshotChanges()),
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
            switchMap(([{ token, isDefault }, user]: [any, User]) => {
                const createCard = this.fns.httpsCallable('createStripeSource')
                return createCard({ stripeId: user.stripeCustomerId, token, userId: user.id }).pipe(
                    map(({ err, resp }) => ({ err, resp, isDefault }))
                )
            }),
            switchMap(({ err, resp, isDefault }) => {
                const actions = [
                    AppActions.stopLoading(),
                    UserAccountActions.fetchLatestUserData(),
                    UserAccountActions.creditCardSaved({ error: err, resp })
                ]
                return !isDefault || err
                    ? actions
                    : [
                        ...actions,
                        UserAccountActions.setDefaultPaymentSource({ defaultPaymentSource: resp['id'] as string })
                    ]
            })
        )
    )

    addCharge$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UserAccountActions.sendCharge),
            withLatestFrom(this.store.select(userSelector)),
            switchMap(([{ sourceId, amount, reservationId, selectedTime, space }, user]) => {
                const createCharge = this.fns.httpsCallable('createStripeCharge')
                return createCharge({
                    user,
                    sourceId,
                    amount,
                    reservationId,
                    selectedTime,
                    space,
                })
            }),
            switchMap(({ err, resp }) => {
                return [
                    AppActions.stopLoading(),
                    UserAccountActions.paymentSaved({ error: err, resp })
                ]
            })
        )
    )

    updateUserData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UserAccountActions.updateUserData),
            withLatestFrom(this.store.select(userSelector)),
            switchMap(([{ userData }, user]) => this.db.object(`users/${userData.id}`).update(userData)
                .then(() => ({ error: null, resp: { ...user, ...userData } }))
                .catch(error => ({ error, resp: false }))
            ),
            flatMap(({ resp, error }) => error
                ? [
                    AppActions.setLoginFeedback({ success: false, message: JSON.stringify(error) }),
                    AppActions.stopLoading()
                ]
                : [
                    AppActions.loginSuccess({ user: resp }),
                    AppActions.setLoginFeedback({ success: true, message: null }),
                    AppActions.stopLoading()
                ]
            )
        )
    )

    setDefaultPaymentSource$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UserAccountActions.setDefaultPaymentSource),
            withLatestFrom(this.store.select(userSelector)),
            switchMap(([{ defaultPaymentSource }, user]) => this.db.object(`users/${user.id}`).update({ defaultPaymentSource })),
            map(() => AppActions.stopLoading())
        )
    )

    fetchUserTransactions$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UserAccountActions.fetchUserTransactions),
            withLatestFrom(this.currentUserId$),
            takeWhile(([{ }, userId]) => !!userId),
            switchMap(([{ }, userId]) => {
                return this.afs.collection(
                    `transactions`,
                    ref => ref.where('userId', '==', userId)
                ).snapshotChanges()
            })
            ,
            map((docs: DocumentChangeAction<Transaction>[]) => {
                return docs.map(data => {
                    const id = data.payload.doc.id
                    const doc = data.payload.doc.data()
                    return { id, ...doc }
                })
            }),
            map(transactions => UserAccountActions.storeUserTransactions({ transactions }))
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