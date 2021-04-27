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
import { USE_EMULATOR as USE_AUTH_EMULATOR } from '@angular/fire/auth';
import { USE_EMULATOR as USE_DATABASE_EMULATOR } from '@angular/fire/database';
import { USE_EMULATOR as USE_FIRESTORE_EMULATOR } from '@angular/fire/firestore';
import { USE_EMULATOR as USE_FUNCTIONS_EMULATOR } from '@angular/fire/functions';
import { AngularFireModule } from '@angular/fire';
import { CalendarHeaderComponent } from './components/calendar-header/calendar-header.component';
import { AppEffects } from './app.effects';
import { NewUserComponent } from './login/new-user/new-user.component';
import { GenericPopupComponent } from './components/generic-popup/generic-popup.component';
import { ForgotPasswordComponent } from './login/forgot-password/forgot-password.component';
import { AddPaymentMethodComponent } from './components/add-payment-method/add-payment-method.component';
import { ConfirmPaymentFormComponent } from './components/confirm-payment-form/confirm-payment-form.component';
import { MatBadgeModule } from '@angular/material/badge';
import { AngularFirePerformanceModule, PerformanceMonitoringService } from '@angular/fire/performance';
import { LoadingComponent } from './components/loading/loading.component'
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
    LoadingComponent,
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
  providers: [
    PerformanceMonitoringService,
    { provide: USE_AUTH_EMULATOR, useValue: environment.useEmulator ? ['localhost', 9099] : undefined },
    { provide: USE_DATABASE_EMULATOR, useValue: environment.useEmulator ? ['localhost', 9000] : undefined },
    { provide: USE_FIRESTORE_EMULATOR, useValue: environment.useEmulator ? ['localhost', 8080] : undefined },
    { provide: USE_FUNCTIONS_EMULATOR, useValue: environment.useEmulator ? ['localhost', 5001] : undefined },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }


