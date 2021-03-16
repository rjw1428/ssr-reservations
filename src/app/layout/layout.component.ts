import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { AppState } from '../models/app-state';
import { loadingSelector, userSelector } from '../app.selectors';
import { LoginComponent } from '../login/login.component';
import { MatDialog } from '@angular/material/dialog';
import { User } from '../models/user';
import { AppActions } from '../app.action-types';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayoutComponent implements OnInit {

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  isLoading$: Observable<boolean> = this.store.select(loadingSelector)

  user$: Observable<User> = this.store.select(userSelector)


  constructor(
    private breakpointObserver: BreakpointObserver,
    private store: Store<AppState>,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
  }

  onLogIn() {
    this.dialog.open(LoginComponent, {
      // maxWidth: '300px',
      width: '300px'
    })
  }

  onLogOut() {
    this.store.dispatch(AppActions.logOut())
  }
}
