import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as auth from 'firebase/auth'
import { environment } from 'src/environments/environment';
import { AppActions } from './app.action-types';
import { AppState } from './models/app-state';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(
    private firebaseAuth: AngularFireAuth,
    private router: Router,
    private store: Store<AppState>
  ) { }

  ngOnInit() {
    this.store.dispatch(AppActions.checkUserPersistance())
    this.store.dispatch(AppActions.startLoading())
  }
}
