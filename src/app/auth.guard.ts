import { Injectable, NgZone } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private firebaseAuth: AngularFireAuth,
    private router: Router,
    private ngZone: NgZone
  ) { }

  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {

    return new Promise((resolve, reject) => {
      this.firebaseAuth.onAuthStateChanged((user) => {
        const isLoggedIn = !!user
        if (!isLoggedIn) this.ngZone.run(()=>this.router.navigate(['/', 'login']))
        resolve(isLoggedIn)
      })
    })
  }
}
