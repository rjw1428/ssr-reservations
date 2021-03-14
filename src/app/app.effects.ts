import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AngularFirestore, DocumentChangeAction } from "@angular/fire/firestore";
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireAuth } from '@angular/fire/auth';
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { from, of } from "rxjs";
import { flatMap, map, mergeMap, switchMap } from "rxjs/operators";
import { AppActions } from "./app.action-types";
import { MatDialog } from "@angular/material/dialog";
import { RedirectComponent } from "./login/redirect/redirect.component";
import { Router } from "@angular/router";
import { environment } from "src/environments/environment";


@Injectable()
export class AppEffects {

    logUserIn$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AppActions.login),
            switchMap(({ username, password }) => this.firebaseAuth.signInWithEmailAndPassword(username, password)),
            map(resp => {
                if (!resp.user.emailVerified) {
                    console.log("NOT VERIFIED")
                    return AppActions.stopLoading()
                }
                return AppActions.loginSuccess({ uid: resp.user.uid })
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
    createUiser$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AppActions.createUser),
            switchMap(({ user }) => from(this.firebaseAuth.createUserWithEmailAndPassword(user.email, user.password)).pipe(
                map(resp => ({ ...resp, userInput: user }))
            )),
            map(enrolledUser => {
                const { password, ...userData } = enrolledUser.userInput
                this.db.database.ref(`users/${enrolledUser.user.uid}`).set(userData)
                enrolledUser.user.sendEmailVerification({
                    url: environment.domain,
                })
            }),
            switchMap(() => this.dialog.open(RedirectComponent, { width: '300px' }).afterClosed().pipe(
                map(() => this.router.navigate(['/']))
            ))
        ), { dispatch: false }
    )

    // AppActions.newUserCreated()
    // () => AppActions.loginSuccess({ uid: enrolledUser.user.uid })

    constructor(
        private actions$: Actions,
        private afs: AngularFirestore,
        private db: AngularFireDatabase,
        private firebaseAuth: AngularFireAuth,
        public dialog: MatDialog,
        private router: Router
    ) { }
}