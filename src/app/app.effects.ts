import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AngularFirestore, DocumentChangeAction } from "@angular/fire/firestore";
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireAuth } from '@angular/fire/auth';
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { from, of } from "rxjs";
import { first, flatMap, map, mergeMap, switchMap } from "rxjs/operators";
import { AppActions } from "./app.action-types";
import { MatDialog } from "@angular/material/dialog";
import { GenericPopupComponent } from "./components/generic-popup/generic-popup.component";
import { Router } from "@angular/router";
import { environment } from "src/environments/environment";
import { DataSnapshot } from "@angular/fire/database/interfaces";
import { Product } from "./models/product";
import { UserAccountActions } from "./user/user.action-types";
import { AdminActions } from "./admin/admin.action-types";
import { cachedProductListSelector } from "./app.selectors";
import { AppState } from "./models/app-state";
import { Store } from "@ngrx/store";


@Injectable()
export class AppEffects {

    logUserIn$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AppActions.login),
            switchMap(({ username, password }) => this.firebaseAuth.signInWithEmailAndPassword(username, password)),
            map(resp => {
                console.log(resp)
                return AppActions.getUserAccount({ uid: resp.user.uid })
                // if (!resp.user.emailVerified) console.log("NOT VERIFIED")
                // return resp.user.emailVerified
                //     ? AppActions.getUserAccount({ uid: resp.user.uid })//User Session has persisted
                //     : AppActions.noAction()
            })
        )
    )
    /*
            Create User => Create User Space in Realtime DB => Send Verification Email => Trigger Popup => Redirect to login
            Notes: 
             - createUserWithEmailAndPassword will check for short passwords and already existing accounts
            and return an error, so once a valid response is returned from that switchMap, a NEW user is created
             - DB shouldnt be created until verification occurs (future fix)
    */
    checkUserPersistance$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AppActions.checkUserPersistance),
            switchMap(() => new Promise((resolve, reject) => {
                this.firebaseAuth.onAuthStateChanged(authData => resolve(authData))
            })),
            map(authData =>
                authData
                    ? AppActions.getUserAccount({ uid: authData['uid'] })//User Session has persisted
                    : AppActions.noAction()
            )
        )
    )

    getUserAccount$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AppActions.getUserAccount),
            switchMap(({ uid }) =>
                new Promise((resolve, reject) => {
                    this.db.database.ref(`users/${uid}`).update({ lastLogIn: new Date().getTime() })
                        .then(() => resolve(uid))
                })
            ),
            switchMap(uid => {
                console.log("Logged In As: ", uid)
                return new Promise((resolve, reject) => {
                    this.db.database.ref(`users/${uid}`).get()
                        .then(snapshot => resolve(snapshot))
                        .catch(err => {
                            console.log(err)
                            resolve(null)
                        })
                })
            }),
            map((snapshot: null | DataSnapshot) => {
                if (!snapshot)
                    return AppActions.stopLoading()
                const user = snapshot.val()
                return AppActions.loginSuccess({ user })
            })
        )
    )


    createUser$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AppActions.createUser),
            switchMap(({ user }) => from(this.firebaseAuth.createUserWithEmailAndPassword(user.email, user.password)).pipe(
                map(resp => ({ ...resp, userInput: user }))
            )),
            map(enrolledUser => {
                const { password, ...userData } = enrolledUser.userInput
                this.db.database
                    .ref(`users/${enrolledUser.user.uid}`)
                    .set({
                        ...userData,
                        id: enrolledUser.user.uid
                    })
                // enrolledUser.user.sendEmailVerification({
                //     url: environment.domain,
                // })

            }),
            map(() => this.router.navigate(['user', 'application']))
            // switchMap(() => this.dialog.open(GenericPopupComponent, {
            //     width: '300px',
            //     data: {
            //         title: 'Almost done...',
            //         content:
            //             `<p>
            //         A verification email has been sent to you. 
            //         Please verify your email address to log in and get started.
            //         </p>`
            //     }
            // }).afterClosed().pipe(
            //     map(() => this.router.navigate(['/']))
            // ))
        ), { dispatch: false }
    )

    // AppActions.newUserCreated()
    // () => AppActions.loginSuccess({ uid: enrolledUser.user.uid })


    resetPassword$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AppActions.resetPassword),
            switchMap(({ email }) => from(this.firebaseAuth.sendPasswordResetEmail(email)).pipe(map(resp => email))),
            switchMap(email => this.dialog.open(GenericPopupComponent, {
                width: '300px',
                data: {
                    title: 'Password Reset Email Sent',
                    content:
                        `<p>
                    An email has been sent to the ${email}. 
                    Please check your inbox and follow the instructions in the email to reset your password.
                    </p>`
                }
            }).afterClosed().pipe(
                map(() => this.router.navigate(['/']))
            ))
        ), { dispatch: false }
    )

    logUserOut$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AppActions.logOut),
            switchMap(() => this.firebaseAuth.signOut()),
            flatMap(() => [UserAccountActions.logout(), AdminActions.logout()])
        )
    )

    getProductTyles$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AppActions.getProductTypes),
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

    getProductDetails$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AppActions.fetchSpaceDetails),
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
            map(({ spaceName, reservation, product }) => AppActions.storedSpaceDetails({ spaceName, reservationId: reservation.id, product }))
        )
    )

    constructor(
        private actions$: Actions,
        private afs: AngularFirestore,
        private db: AngularFireDatabase,
        private firebaseAuth: AngularFireAuth,
        public dialog: MatDialog,
        private router: Router,
        private store: Store<AppState>
    ) { }
}