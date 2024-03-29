import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { filter, map, shareReplay, switchMap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { AppState } from '../models/app-state';
import { loadingSelector, userSelector } from '../app.selectors';
import { LoginComponent } from '../login/login.component';
import { MatDialog } from '@angular/material/dialog';
import { User } from '../models/user';
import { AppActions } from '../app.action-types';
import { Router } from '@angular/router';
import { MatSidenav } from '@angular/material/sidenav';
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
  @ViewChild('drawer') drawer: MatSidenav
  constructor(
    private breakpointObserver: BreakpointObserver,
    private store: Store<AppState>,
    public dialog: MatDialog,
    private router: Router
  ) { }

  ngOnInit() {
    //Close navbar if mobile mode and route changes
    this.router.events.pipe(
      switchMap(()=>this.isHandset$),
    ).subscribe(isHandSet => {
      isHandSet 
        ? this.drawer.close()
        : this.drawer.open()
    });
  }

  onLogIn() {
    this.dialog.open(LoginComponent, {
      // maxWidth: '300px',
      width: '300px'
    })
  }

  onAccountInfo() {
    this.router.navigate(['user', 'account'])
  }

  showAdminPanel(): Observable<boolean> {
    const rolesWithAccess = ['admin', 'master']
    return this.user$.pipe(map(user => user && rolesWithAccess.includes(user.role)))
  }

  showUserPanel(): Observable<boolean> {
    const rolesWithAccess = ['user', 'master']
    return this.user$.pipe(map(user => !user || rolesWithAccess.includes(user.role)))
  }

  onLogOut() {
    this.store.dispatch(AppActions.logOut())
  }

  onEmail(address: string) {
    window.location.href = `mailto:${address}`
  }
}
