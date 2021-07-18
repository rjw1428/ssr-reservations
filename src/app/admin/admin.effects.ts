import { JsonPipe } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AngularFireDatabase, SnapshotAction } from "@angular/fire/database";
import { AngularFirestore, DocumentChangeAction } from "@angular/fire/firestore";
import { AngularFireFunctions } from "@angular/fire/functions";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { forkJoin, from, of } from "rxjs";
import { filter, find, first, flatMap, map, mergeMap, reduce, switchMap, tap, withLatestFrom } from "rxjs/operators";
import { AppActions } from "../app.action-types";
import { cachedProductListSelector, userSelector } from "../app.selectors";
import { GenericPopupComponent } from "../components/generic-popup/generic-popup.component";
import { AppState } from "../models/app-state";
import { Product } from "../models/product";
import { ProductSummary } from "../models/product-summary";
import { Reservation } from "../models/reservation";
import { Space } from "../models/space";
import { Transaction } from "../models/transaction";
import { User } from "../models/user";
import { getUsedTimes, isOverlapingTime, padLeadingZeros, showSnackbar } from "../utility/utility";
import { AdminActions } from "./admin.action-types";

@Injectable()
export class AdminEffects {

    deleteProduct$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AdminActions.removeProductType),
            switchMap(({ id }) => Promise.all([
                this.afs.collection('products').doc(id).update({ isActive: false }),
                // this.db.list(`spaces/${id}`).remove()
            ])),
            map(resp => AppActions.stopLoading())
        )
    )

    saveNewProduct$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AdminActions.saveProduct),
            switchMap(({ product }) => from(this.afs.collection('products').add(product))
                .pipe(map(resp => ({ id: resp.id, product })))
            ),
            switchMap((resp) => {
                this.afs.collection('products').doc(resp.id).update({ id: resp.id })
                const templateSpace: Space = { productId: resp.id, reserved: [], name: '' }
                const spaceGroup = Array(resp.product.count).fill(templateSpace)
                return forkJoin(spaceGroup.map((space, i) => this.db.list(`spaces/${resp.id}`).push({
                    ...space,
                    name: `${resp.product.name} - ${padLeadingZeros(i + 1, 3)}`
                })))
            }),
            flatMap(resp => {
                return resp
                    ? [
                        AppActions.stopLoading(),
                        AdminActions.saveProductComplete()
                    ]
                    : [AppActions.stopLoading()]
            })
        )//, {dispatch: false}
    )


    editProductType$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AdminActions.editProduct),
            switchMap(({ updatedProduct }) => {
                const { id, ...product } = updatedProduct
                return this.afs.collection('products').doc(id).update(product)
            }),
            flatMap((resp) => {
                // NO CONFIRMATION THAT UDATE WORKED???
                return [
                    AppActions.stopLoading(),
                    AdminActions.saveProductComplete()
                ]
            })
        )
    )

    fetchAdminSummary$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AdminActions.getAdminSummary),
            switchMap(() => this.db.object<{ [id: string]: ProductSummary }>('spaces').snapshotChanges()),
            switchMap((resp) => {
                const summary = resp.payload.val()
                return [
                    AdminActions.storeAdminSummary({ summary }),
                    AppActions.stopLoading()
                ]
            })
        )
    )

    fetchUserList$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AdminActions.getUserList),
            switchMap(() => this.store.select(userSelector)),
            switchMap(user => {
                if (!user) return of(null)
                return ['master', 'admin'].includes(user.role)
                    ? this.db.object<{ [userId: string]: User }>('users').snapshotChanges()
                    : of(null)
            }),
            map((resp) => {
                const users = resp
                    ? resp.payload.val()
                    : null
                return AdminActions.storeUserList({ users })
            })
        )
    )

    fetchUserReservations$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AdminActions.getUserReservation),
            switchMap(({ userId }) => this.db.object<{ [applicationId: string]: Reservation }>(`accepted-applications/${userId}`).snapshotChanges().pipe(
                map((resp) => {
                    const reservations = resp.payload.val()
                    return { [userId]: reservations }
                }),
            )),
            map(reservations => AdminActions.storeUserReservation({ reservations }))
        )
    )

    getFullReservationDataFromList$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AdminActions.getFullReservationDataFromList),
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
            map((resp) => AppActions.openReservation(resp))
        )
    )

    getFullReservationDataFromSummary$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AdminActions.getFullReservationDataFromSummary),
            switchMap(({ reservationId, productId, userId, spaceName }) => {
                // Get Matching Product Type
                return this.store.select(cachedProductListSelector).pipe(
                    first(),
                    map(products => {
                        const matchingProduct = products.find(product => product.id == productId)
                        return { reservationId, product: matchingProduct, userId, spaceName }
                    })
                )
            }),
            switchMap(({ reservationId, product, userId, spaceName }) => {
                //Get Space Name
                return this.db.object(`accepted-applications/${userId}/${reservationId}`).valueChanges()
                    .pipe(map((data: Reservation) => {
                        const reservation = { id: reservationId, ...data }
                        return { spaceName, reservation, product }
                    }))
            }),
            map((resp) => AppActions.openReservation(resp))
        )
    )

    getFullReservationFromTransaction$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AdminActions.getFullReservationFromTransaction),
            switchMap(({ reservationId, userId, spaceName }) => {
                return this.db.object<Reservation>(`accepted-applications/${userId}/${reservationId}`).valueChanges()
                    .pipe(
                        map(data => {
                            const reservation = { id: reservationId, ...data }
                            return { spaceName, reservation }
                        })
                    )
            }),
            switchMap(({ spaceName, reservation }) => {
                return this.afs.doc<Product>(`products/${reservation.productId}`).valueChanges()
                    .pipe(
                        first(),
                        map(product => ({ spaceName, reservation, product }))
                    )
            }),
            map((resp) => {
                return AppActions.openReservation(resp)
            })
        )
    )

    promoteUser$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AdminActions.promote),
            switchMap(({ userId }) => this.db.database.ref(`users/${userId}`).update({ role: 'admin' })),
            tap(() => showSnackbar(this.snackBar, "Account promoted to Admin."))
        ), { dispatch: false }
    )

    demoteUser$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AdminActions.demoteUser),
            switchMap(({ userId }) => this.db.database.ref(`users/${userId}`).update({ role: 'user' })),
            tap(() => showSnackbar(this.snackBar, "Account set to User."))
        ), { dispatch: false }
    )

    fetchPendingApplications$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AdminActions.fetchSubmittedApplications),
            switchMap(({ filter }) => {
                return this.db.list(`${filter}-applications`).snapshotChanges()
            }),
            map((resp: SnapshotAction<{ [userId: string]: { [applicationId: string]: Reservation[] } }>[]) => {
                return resp.length
                    ? resp
                        .map(res => ({ ...res.payload.val() }))
                        .reduce((totalList, userApplications) => {
                            const userApplicationsList = Object.keys(userApplications)
                                .map(key => ({ ...userApplications[key], id: key }))
                                .filter(application => application['status'] != 'canceled')
                            return totalList.concat(userApplicationsList)
                        }, [])
                    : []
            }),
            // Get Users as well and link with applications
            switchMap((applications: Reservation[]) => this.db.list('users').snapshotChanges()
                .pipe(
                    first(),
                    map((resp) => resp
                        .map(doc => {
                            const id = doc.key
                            const data = doc.payload.val() as User
                            return { [id]: data }
                        })
                        .reduce((acc, cur) => ({ ...acc, ...cur }))
                    ),
                    map(users => applications.map(application => {
                        const user = users[application.userId]
                        return { ...application, user }
                    }))
                )),
            map(applications => AdminActions.storeSubmittedApplications({ applications }))
        )
    )

    stopLoadingOnFilter$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AdminActions.storeSubmittedApplications),
            map(({ applications }) => AppActions.stopLoading())
        )
    )

    updateFilter$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AdminActions.updatedSubmittedApplicationFilter),
            map(({ filter }) => AdminActions.fetchSubmittedApplications({ filter }))
        )
    )

    udateSpaceName$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AdminActions.udateSpaceName),
            switchMap(({ productId, spaceId, currentName }) => {
                return this.dialog.open(GenericPopupComponent, {
                    data: {
                        title: `Rename "${currentName}"`,
                        content: "",
                        actionLabel: 'Rename',
                        action: () => ({ productId, spaceId }),
                        form: ['spaceName']
                    }
                }).afterClosed()
            }),
            filter(formResponse => !!formResponse),
            map(({ action, spaceName }) => this.db.object(`spaces/${action.productId}/${action.spaceId}`).update({ name: spaceName }))
        ), { dispatch: false }
    )

    rejectApplicationForm$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AdminActions.rejectApplicationFeedbackForm),
            switchMap(({ application }) => {
                return this.dialog.open(GenericPopupComponent, {
                    data: {
                        title: `Provide Rejection Feedback`,
                        content: application.isAlreadyBooked
                            ? "A previously accepted application has made this date range no longer available."
                            : "",
                        actionLabel: 'Reject',
                        action: () => application,
                        form: ['feedback']
                    }
                }).afterClosed()
            }),
            filter(formResponse => !!formResponse),
            map(({ action, feedback }) => AdminActions.rejectApplication({ application: { ...action, feedback } }))
        )
    )

    rejectApp$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AdminActions.rejectApplication),
            map(({ application }) => {
                const { user, id, createdTime, ...reservation } = application
                // Write application to Accepted
                this.db.database.ref(`rejected-applications/${application.userId}/`).child(application.id)
                    .set({
                        ...reservation,
                        status: "rejected",
                        feedback: application.feedback,
                        decisionDate: new Date().getTime()
                    })

                showSnackbar(this.snackBar, `Application for ${user.firstName} - Rejected`)


                // Delete pending application
                this.db.object(`pending-applications/${application.userId}/${application.id}`).remove()
                return application
            })
        ), { dispatch: false }
    )

    acceptApplicatoin$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AdminActions.acceptApplication),
            switchMap(({ application }) => {
                const { user, id, createdTime, ...reservation } = application
                const usedTimes = getUsedTimes(application.startDate, application.endDate)
                const payload = usedTimes
                    .map(time => ({
                        [time]: {
                            user: application.userId,
                            reservation: application.id
                        }
                    }))
                    .reduce((acc, cur) => ({ ...acc, ...cur }), {})
                // Create Reserved Month list in the space
                this.db.object(`spaces/${application.productId}/${application.spaceId}/reserved`).update(payload)

                // Write application to Accepted
                this.db.database.ref(`accepted-applications/${application.userId}/`).child(application.id)
                    .set({
                        ...reservation,
                        status: "accepted",
                        feedback: "Accepted",
                        decisionDate: new Date().getTime(),
                        unpaidTimes: getUsedTimes(application.startDate, application.endDate).reduce((acc, time) => {
                            const val = { [time]: time }
                            return { ...acc, ...val }
                        }, {})
                    })

                // Delete pending application
                this.db.object(`pending-applications/${application.userId}/${application.id}`).remove()

                //Snackbar
                showSnackbar(this.snackBar, `Application for ${user.firstName} - Accepted`)

                // Search Pending Applications for duplicates
                return this.db.list(`pending-applications`).snapshotChanges().pipe(
                    first(),
                    map((resp: SnapshotAction<{ [appId: string]: Reservation }>[]) => {
                        return resp.reduce((agg, doc) => {
                            const payload = doc.payload.val()
                            const userApps = Object.keys(payload).map(id => ({ ...payload[id], id }))
                            return userApps.length
                                ? agg.concat(userApps.filter(res =>
                                    res.spaceId == application.spaceId
                                    && isOverlapingTime(application.startDate, application.endDate, res.startDate, res.endDate)))
                                : agg
                        }, [] as Reservation[])
                    })
                )
            }),
            map(duplicateReservations => duplicateReservations.map(application =>
                this.db.object(`pending-applications/${application.userId}/${application.id}`).update({ isAlreadyBooked: true })
            ))
        ), { dispatch: false }
    )

    fetchUserTransactions$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AdminActions.fetchTransactions),
            switchMap(() => this.store.select(userSelector)),
            switchMap(user => {
                if (!user) return of([])
                return ['master', 'admin'].includes(user.role)
                    ? this.afs.collection<Transaction>(`transactions`).snapshotChanges()
                    : of([])
            }),
            map(docs => docs.map(data => {
                const id = data.payload.doc.id
                const doc = data.payload.doc.data()
                return { id, ...doc }
            })),
            map(transactions => AdminActions.storeTransactions({ transactions }))
        )
    )

    cancelLeaseAgreement$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AdminActions.cancelReservation),
            switchMap(({ lease }) => {
                getUsedTimes(lease.startDate, lease.endDate)
                    .filter(time => lease.unpaidTimes
                        ? Object.keys(lease.unpaidTimes).map(unpaid => +unpaid).includes(time)
                        : false)
                    .map(time => {
                        return this.db.object(`spaces/${lease.productId}/${lease.spaceId}/reserved/${time}`).remove()
                    })
                return this.db.object(`accepted-applications/${lease.userId}/${lease.id}`)
                    .update({ status: 'canceled', lastModifiedTime: new Date().getTime() })
                    .then(() => lease)
            }),
            switchMap(lease => {
                showSnackbar(this.snackBar, "User has been notified of their cancelation")
                const triggerCaneledLeaseEmail = this.fns.httpsCallable('triggerCaneledLeaseEmail')
                return triggerCaneledLeaseEmail(lease)
            }),
            map(() => AppActions.stopLoading())
        )
    )


    constructor(
        private store: Store<AppState>,
        private actions$: Actions,
        private afs: AngularFirestore,
        private db: AngularFireDatabase,
        private dialog: MatDialog,
        private router: Router,
        private snackBar: MatSnackBar,
        private fns: AngularFireFunctions,
    ) { }

}