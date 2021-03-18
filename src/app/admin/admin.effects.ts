import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AngularFireDatabase } from "@angular/fire/database";
import { AngularFirestore, DocumentChangeAction } from "@angular/fire/firestore";
import { MatDialog } from "@angular/material/dialog";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { forkJoin, from, of } from "rxjs";
import { filter, find, first, flatMap, map, mergeMap, switchMap } from "rxjs/operators";
import { AppActions } from "../app.action-types";
import { cachedProductListSelector } from "../app.selectors";
import { GenericPopupComponent } from "../components/generic-popup/generic-popup.component";
import { AdminSummary } from "../models/admin-summary";
import { AppState } from "../models/app-state";
import { Product } from "../models/product";
import { ProductSummary } from "../models/product-summary";
import { Reservation } from "../models/reservation";
import { Space } from "../models/space";
import { User } from "../models/user";
import { padLeadingZeros } from "../utility/constants";
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
                console.log(resp)
                this.afs.collection('products').doc(resp.id).update({ id: resp.id })
                const templateSpace: Space = { productId: resp.id, reserved: [], name: '' }
                const spaceGroup = Array(resp.product.count).fill(templateSpace)
                console.log(spaceGroup)
                return forkJoin(spaceGroup.map((space, i) => this.db.list(`spaces/${resp.id}`).push({
                    ...space,
                    name: `${resp.product.name} - ${padLeadingZeros(i + 1, 3)}`
                })))
            }),
            flatMap(resp => {
                console.log(resp)
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
            switchMap(({ userId }) => this.db.list(`reservations/${userId}`).snapshotChanges().pipe(
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
                return this.db.object(`reservations/${userId}/${reservationId}`).valueChanges()
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




    constructor(
        private store: Store<AppState>,
        private actions$: Actions,
        private afs: AngularFirestore,
        private db: AngularFireDatabase,
        private dialog: MatDialog

    ) { }
}

// switchMap(() => this.db.list('spaces').valueChanges()),
// map((resp: ProductSummary[]) => {
//     console.log(resp)
//     const summary: AdminSummary = resp
//         .map(product => {
//             const firstSpace = Object.keys(product)[0]
//             const productId = product[firstSpace].productId
//             return { [productId]: product }
//         })
//         .reduce((acc, cur) => ({ ...acc, ...cur }))

// }),
// map(summary => AdminActions.storeAdminSummary({ summary }))