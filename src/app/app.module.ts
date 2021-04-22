import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutComponent } from './layout/layout.component';
import { LoginComponent } from './login/login.component';
import { SharedModule } from './shared/shared.module';
import { AddProductTypeComponent } from './admin/add-product-type/add-product-type.component';
import { AngularFireAuthModule } from '@angular/fire/auth';

import { HomeComponent } from './home/home.component';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from 'src/environments/environment';
import { appReducer } from './app.reducer';
import { AppRoutingModule } from './app-routing.module';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireModule } from '@angular/fire';
import { CalendarHeaderComponent } from './components/calendar-header/calendar-header.component';
import { AppEffects } from './app.effects';
import { NewUserComponent } from './login/new-user/new-user.component';
import { GenericPopupComponent } from './components/generic-popup/generic-popup.component';
import { ForgotPasswordComponent } from './login/forgot-password/forgot-password.component';
import { AddPaymentMethodComponent } from './components/add-payment-method/add-payment-method.component';
import { ConfirmPaymentFormComponent } from './components/confirm-payment-form/confirm-payment-form.component';
import { MatBadgeModule } from '@angular/material/badge';
import { AngularFirePerformanceModule, PerformanceMonitoringService } from '@angular/fire/performance'
@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
    LoginComponent,
    AddProductTypeComponent,
    HomeComponent,
    CalendarHeaderComponent,
    NewUserComponent,
    GenericPopupComponent,
    ForgotPasswordComponent,
    AddPaymentMethodComponent,
    ConfirmPaymentFormComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    SharedModule,
    MatBadgeModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFirePerformanceModule,
    StoreModule.forRoot({ app: appReducer }, {
      runtimeChecks: {
        strictStateImmutability: true,
        strictActionImmutability: true,
        strictActionSerializability: true
      }
    }),
    EffectsModule.forRoot([AppEffects]),
    StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: environment.production }),
  ],
  providers: [PerformanceMonitoringService],
  bootstrap: [AppComponent]
})
export class AppModule { }


