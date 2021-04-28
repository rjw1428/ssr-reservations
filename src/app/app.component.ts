import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppActions } from './app.action-types';
import { AppState } from './models/app-state';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(
    private store: Store<AppState>
  ) { }

  ngOnInit() {
    this.store.dispatch(AppActions.checkUserPersistance())
  }
}
