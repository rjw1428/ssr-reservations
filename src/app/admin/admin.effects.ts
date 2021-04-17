import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AngularFireDatabase, SnapshotAction } from "@angular/fire/database";
import { AngularFirestore, DocumentChangeAction } from "@angular/fire/firestore";
import { MatDialog } from "@angular/material/dialog";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { forkJoin, from, of } from "rxjs";
import { filter, find, first, flatMap, map, mergeMap, reduce, switchMap } from "rxjs/operators";
import { AppActions } from "../app.action-types";
import { cachedProductListSelector } from "../app.selectors";
import { GenericPopupComponent } from "../components/generic-popup/generic-popup.component";
import { AppState } from "../models/app-state";
import { Product } from "../models/product";
import { ProductSummary } from "../models/product-summary";
import { Reservation } from "../models/reservation";
import { Space } from "../models/space";
import { User } from "../models/user";
import { getUsedTimes } from "../utility/constants";
import { AdminActions } from "./admin.action-types";

@Injectable()
export class AdminEffects {

    getProducts$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AdminActions.getPoductList),
            switchMap(() => this.afs.collection('products').snapshotChanges()),
            map((docs: DocumentChangeAction<Product>[]) => {
                return docs
                    .reduce((obj, doc) => {
                        const id = doc.payload.doc.id
                        const data = { id, ...doc.payload.doc.data() }
                        return { ...obj, [id]: data }
                    }, {})
            }),
            map(products => AppActions.storeProductsList({ products }))
        )
    )

    deleteProduct$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AdminActions.removeProductType),
            switchMap(({ id }) => Promise.all([
                this.afs.collection('products').doc(id).delete(),
                this.db.list(`spaces/${id}`).remove()
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
                    name: `${resp.product.name}` // - ${padLeadingZeros(i + 1, 3)}
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
        )//, {dispatch: false}
    )

    fetchAdminSummary$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AdminActions.getAdminSummary),
            switchMap(() => this.db.list('spaces').snapshotChanges().pipe(
                map((resp) => resp
                    .map(doc => {
                        const id = doc.key
                        const data = doc.payload.val() as ProductSummary
                        return { [id]: data }
                    })
                    .reduce((acc, cur) => ({ ...acc, ...cur }))
                ),
            )),
            map(summary => AdminActions.storeAdminSummary({ summary }))
        )//, { dispatch: false }
    )

    fetchUserList$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AdminActions.getUserList),
            switchMap(() => this.db.list('users').snapshotChanges().pipe(
                map((resp) => resp
                    .map(doc => {
                        const id = doc.key
                        const data = doc.payload.val() as User
                        return { [id]: data }
                    })
                    .reduce((acc, cur) => ({ ...acc, ...cur }))
                ),
            )),
            map(users => AdminActions.storeUserList({ users }))
        )
    )

    fetchUserReservations$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AdminActions.getUserReservation),
            switchMap(({ userId }) => this.db.list(`accepted-applications/${userId}`).snapshotChanges().pipe(
                map((resp) => ({
                    [userId]: resp
                        .map(doc => {
                            const id = doc.key
                            const data = doc.payload.val() as Reservation
                            return { [id]: data }
                        })
                        .reduce((acc, cur) => ({ ...acc, ...cur }), {})
                })
                ),
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
            map((resp) => AdminActions.openReservation(resp))
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
            map((resp) => AdminActions.openReservation(resp))
        )
    )

    openReservationPopup$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AdminActions.openReservation),
            map(({ spaceName, reservation, product }) => {
                // Open Dialog
                return this.dialog.open(GenericPopupComponent, {
                    data: {
                        title: `Reservation ${reservation.id}`,
                        content: `<h1>${product.name}: ${spaceName}</h1>`
                    }
                })
            })
        ), { dispatch: false }
    )

    promoteUser$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AdminActions.promote),
            switchMap(({ userId }) => this.db.database.ref(`users/${userId}`).update({ role: 'admin' }))
        ), { dispatch: false }
    )

    demoteUser$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AdminActions.demoteUser),
            switchMap(({ userId }) => this.db.database.ref(`users/${userId}`).update({ role: 'user' }))
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

    updateFilter$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AdminActions.updatedSubmittedApplicationFilter),
            map(({ filter }) => AdminActions.fetchSubmittedApplications({ filter }))
        )
    )

    rejectApplicationForm$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AdminActions.rejectApplicationFeedbackForm),
            switchMap(({ application }) => {
                return this.dialog.open(GenericPopupComponent, {
                    data: {
                        title: `Provide Rejection Feedback`,
                        content: "",
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
            switchMap(({ application }) => {
                const { user, id, createdTime, ...reservation } = application
                // Write application to Accepted
                this.db.object(`rejected-applications/${application.userId}/${application.id}`)
                    .set({ ...reservation, status: "rejected", feedback: application.feedback, lastModifiedTime: new Date().getTime() })

                // Delete pending application
                return this.db.object(`pending-applications/${application.userId}/${application.id}`).remove()
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
                this.db.object(`accepted-applications/${application.userId}/${application.id}`)
                    .set({ ...reservation, status: "accepted", feedback: "Accepted", lastModifiedTime: new Date().getTime() })

                // Delete pending application
                this.db.object(`pending-applications/${application.userId}/${application.id}`).remove()

                // Search Pending Applications for duplicates
                return this.db.list(`pending-applications`).snapshotChanges().pipe(
                    first(),
                    map((resp: SnapshotAction<{ [appId: string]: Reservation }>[]) => {
                        return resp.reduce((agg, doc) => {
                            const payload = doc.payload.val()
                            const x = Object.keys(payload).map(id => ({ ...payload[id], id }))
                            return x.length
                                ? agg.concat(x.filter(res =>
                                    res.spaceId == application.spaceId
                                    && this.isOverlapingTime(application.startDate, application.endDate, res.startDate, res.endDate)))
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


    constructor(
        private store: Store<AppState>,
        private actions$: Actions,
        private afs: AngularFirestore,
        private db: AngularFireDatabase,
        private dialog: MatDialog

    ) { }

    isOverlapingTime(approvedStart, approvedEnd, compareStart, compareEnd) {
        // Compare comes before Approved
        if (compareEnd <= approvedStart) return false
        // Approved comes before Compare
        if (approvedEnd <= compareStart) return false

        return true
    }

}