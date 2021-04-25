import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountInfoComponent } from './account-info/account-info.component';
import { ReservationListComponent } from './reservation-list/reservation-list.component';
import { Routes, RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { SharedModule } from '../shared/shared.module';
import { UserAccountEffects } from './user.effects';
import { userAccountReducer } from './user.reducer';
import { ApplicationStatusComponent } from './application-status/application-status.component';
import { PaymentFormComponent } from './payment-form/payment-form.component';
import { AuthGuard } from '../auth.guard';
import { TransactionHistoryComponent } from './transaction-history/transaction-history.component';

const routes: Routes = [
  {
    path: 'account',
    component: AccountInfoComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'application-status',
    component: ApplicationStatusComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'payments',
    component: PaymentFormComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'reservations/:type',
    component: ReservationListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'transactions',
    component: TransactionHistoryComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'reservations',
    redirectTo: 'reservations/current',
  },
]


@NgModule({
  declarations: [
    AccountInfoComponent,
    ReservationListComponent,
    ApplicationStatusComponent,
    PaymentFormComponent,
    TransactionHistoryComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
    StoreModule.forFeature('userAccount', userAccountReducer),
    EffectsModule.forFeature([UserAccountEffects])
  ]
})
export class UserModule { }
