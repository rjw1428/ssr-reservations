import { Injectable, NgZone } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
import { AppState } from './models/app-state';
import { Store } from '@ngrx/store';
import { isAdminSelector } from './app.selectors';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private store: Store<AppState>,
    private router: Router,
    private ngZone: NgZone
  ) { }

  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {

    return new Promise((resolve, reject) => {
      this.store.select(isAdminSelector).pipe(
        filter(isAuth => typeof isAuth == 'boolean')
      ).subscribe(isAuth => {
        if (!isAuth) this.ngZone.run(() => this.router.navigate(['/']))
        resolve(isAuth)
      })
    })
  }
}
