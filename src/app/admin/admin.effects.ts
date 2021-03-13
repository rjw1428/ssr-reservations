import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { map, switchMap } from "rxjs/operators";
import { AppActions } from "../app.action-types";
import { AdminActions } from "./admin.action-types";

@Injectable()
export class AdminEffects {
    // loadCourses$ = createEffect(() =>
    //     this.actions$.pipe(
    //         ofType(GameActions.getPlayerConfig),
    //         concatMap(action => this.configService.getConfig()),
    //         map(config => setPlayerConfig({ config }))
    //     )
    // )

    saveProduct$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AdminActions.saveProduct),
            switchMap(({ product }) => this.afs.collection('products').add(product)),
            map(resp => AppActions.stopLoading())
        )
    )
    constructor(
        private actions$: Actions,
        private afs: AngularFirestore
    ) { }
}