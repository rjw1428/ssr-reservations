import { Component } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { AppState } from '../models/app-state';
import { loadingSelector, userSelector } from '../app.selectors';
import { LoginComponent } from '../login/login.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  isLoading$: Observable<boolean> = this.store.select(loadingSelector)

  isLoggedIn$ = this.store.select(userSelector)
  constructor(
    private breakpointObserver: BreakpointObserver,
    private store: Store<AppState>,
    public dialog: MatDialog
  ) { }

  onLogIn() {
    this.dialog.open(LoginComponent, {
      // maxWidth: '300px',
      width: '300px'
    })
  }
}
