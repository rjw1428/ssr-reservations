import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AngularFireFunctions } from '@angular/fire/functions';
import { AngularFirestore, DocumentChangeAction } from "@angular/fire/firestore";
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireAuth } from '@angular/fire/auth';
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { from, of } from "rxjs";
import { catchError, first, flatMap, map, mergeMap, switchMap } from "rxjs/operators";
import { AppActions } from "./app.action-types";
import { MatDialog } from "@angular/material/dialog";
import { GenericPopupComponent } from "./components/generic-popup/generic-popup.component";
import { Router } from "@angular/router";
import { environment } from "src/environments/environment";
import { AngularFireObject, DataSnapshot, SnapshotAction } from "@angular/fire/database/interfaces";
import { Product } from "./models/product";
import { UserAccountActions } from "./user/user.action-types";
import { AdminActions } from "./admin/admin.action-types";
import { cachedProductListSelector } from "./app.selectors";
import { AppState } from "./models/app-state";
import { Store } from "@ngrx/store";
import { Space } from "./models/space";
import { User } from "./models/user";


@Injectable()
export class AppEffects {

    logUserIn$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AppActions.login),
            switchMap(({ username, password }) => this.firebaseAuth.signInWithEmailAndPassword(username, password)
                .then(authUser => ({ error: null, resp: authUser }))
                .catch(error => ({ error, resp: null }))
            ),
            map(({ error, resp }) => error
                ? AppActions.setLoginFeedback({ success: false, message: error.message })
                : AppActions.getUserAccount({ uid: resp.user.uid })
                // if (!resp.user.emailVerified) console.log("NOT VERIFIED")
                // return resp.user.emailVerified
                //     ? AppActions.getUserAccount({ uid: resp.user.uid })//User Session has persisted
                //     : AppActions.noAction()
            )
        )
    )

    checkUserPersistance$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AppActions.checkUserPersistance),
            switchMap(() => new Promise((resolve, reject) => {
                this.firebaseAuth.onAuthStateChanged(authData => resolve(authData))
            })),
            map(authData => {
                return authData
                    ? AppActions.getUserAccount({ uid: authData['uid'] }) // User Session has persisted
                    : AppActions.noAction()
            })
        )
    )

    getUserAccount$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AppActions.getUserAccount),
            switchMap(({ uid }) => this.db.database.ref(`users/${uid}`).update({ lastLogIn: new Date().getTime() })
                .then(() => uid)
            ),
            switchMap(uid => {
                console.log("Logged In As: ", uid)
                return this.db.database.ref(`users/${uid}`).get() // Get only once
            }),
            flatMap((snapshot: DataSnapshot) => {
                this.router.navigate(['/'])
                const user = snapshot.val()
                return [
                    AppActions.loginSuccess({ user }),
                    AppActions.setLoginFeedback({ success: true, message: null }),
                    AppActions.stopLoading()
                ]
            })
        )
    )

    // ----- START ACCOUNT CREATION ----

    createUser$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AppActions.createUser),
            switchMap(({ user }) => this.firebaseAuth.createUserWithEmailAndPassword(user.email, user.password)
                .then(resp => ({ resp: { ...user, id: resp.user.uid }, error: null }))
                .catch(error => ({ error, resp: null }))
            ),
            map(({ resp, error }) => {
                return error
                    ? AppActions.setLoginFeedback({ success: false, message: error.message })
                    : AppActions.firebaseAuthCreated({ user: resp })
            })
        )
    )

    afterFirebaseAuthCreated$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AppActions.firebaseAuthCreated),
            switchMap(({ user }) => {
                debugger
                const { password, ...userData } = user
                const updatedUser = { ...userData, id: user.id }
                return this.db.database
                    .ref(`users/${user.id}`)
                    .set(updatedUser)
                    .then(() => ({ error: null, updatedUser: { ...updatedUser, password } })) // ADD PASSWORD BACK IN FOR AUTO LOGIN
                    .catch(error => ({ error, updatedUser }))
            }),
            map(({ error, updatedUser }) => {
                debugger
                return error
                    ? AppActions.setLoginFeedback({ success: false, message: error })
                    : AppActions.userAccountWrittenToDb({ user: updatedUser })
            })
        )
    )

    afterUserAccountWrittenToDb$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AppActions.userAccountWrittenToDb),
            switchMap(({ user }) => {
                //WITH FIREBASE USER ID, CREATE STRIPE ID
                const createStripeCustomer = this.fns.httpsCallable("createStripeCustomer")
                return createStripeCustomer(user)
            }),
            map(({ err, resp }) => {
                return err
                    ? AppActions.setLoginFeedback({ success: false, message: JSON.stringify(err) })
                    : AppActions.stripeAccountCreated({ user: resp })
            })
        )
    )

    autoLoginAfterAccountCreation$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AppActions.stripeAccountCreated),
            map(({ user }) => AppActions.login({ username: user.email, password: user.password }))
        )
    )

    // ----- END ACCOUNT CREATION ----

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
            map(() => this.router.navigate(['/'])),
            switchMap(() => this.firebaseAuth.signOut()),
            flatMap(() => [
                UserAccountActions.logout(),
                AdminActions.logout(),
                AppActions.setLoginFeedback({ success: false, message: null })
            ])
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
            switchMap(({ reservation }) => this.db.object(`spaces/${reservation.productId}/${reservation.spaceId}`).snapshotChanges()),
            map((doc: SnapshotAction<Space>) => ({ [doc.key]: doc.payload.val() })),
            map(space => AppActions.storedSpaceDetails({ space }))
        )
    )

    getAllSpaceDetails$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AppActions.fetchAllSpaceDetails),
            switchMap(() => this.db.list(`spaces`).snapshotChanges()),
            map((docs: SnapshotAction<{ [spaceId: string]: Space }>[]) => {
                return docs.reduce((acc, doc) => {
                    const data = doc.payload.val()
                    const dataWithId = Object.keys(data)
                        .map(key => ({ [key]: { ...data[key], id: key } }))
                        .reduce((acc, cur) => ({ ...acc, ...cur }), {})
                    return { ...acc, ...dataWithId }
                }, {})
            }),
            map(spaces => AppActions.storeAllSpaceDetails({ spaces }))
        )
    )

    constructor(
        private actions$: Actions,
        private afs: AngularFirestore,
        private db: AngularFireDatabase,
        private fns: AngularFireFunctions,
        private firebaseAuth: AngularFireAuth,
        public dialog: MatDialog,
        private router: Router,
        private store: Store<AppState>
    ) { }
}