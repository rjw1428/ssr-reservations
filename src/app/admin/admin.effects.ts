import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AngularFireDatabase } from "@angular/fire/database";
import { AngularFirestore, DocumentChangeAction } from "@angular/fire/firestore";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { forkJoin, from, of } from "rxjs";
import { flatMap, map, mergeMap, switchMap } from "rxjs/operators";
import { AppActions } from "../app.action-types";
import { AdminSummary } from "../models/admin-summary";
import { Product } from "../models/product";
import { ProductSummary } from "../models/product-summary";
import { Space } from "../models/space";
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
            map(products => AdminActions.storePoductList({ products }))
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
                    name: `${resp.product.name} - ${padLeadingZeros(i+1, 3)}`
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

    constructor(
        private actions$: Actions,
        private afs: AngularFirestore,
        private db: AngularFireDatabase
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