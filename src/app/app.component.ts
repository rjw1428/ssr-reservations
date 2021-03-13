import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import * as auth from 'firebase/auth'
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(
    private firebaseAuth: AngularFireAuth,
    private router: Router
  ) { }

  ngOnInit() {
    // this.firebaseAuth.setPersistence(auth.Auth.Persistence.LOCAL)
    //   .then(() => {
    //     return this.firebaseAuth.signInWithEmailAndPassword(environment.email, environment.password)
    //   }).then(resp => {
    //     this.router.navigate(['/', 'dashboard'])
    //   })
    //   .catch(err => {
    //     console.log(err.message)
    //   })
    const signIn = this.firebaseAuth.signInWithEmailAndPassword(environment.email, environment.password)
    signIn
      .then(resp => {
        // console.log(resp)
        this.router.navigate(['/'])
      })
      .catch(err => console.log(err.message))
  }
}
