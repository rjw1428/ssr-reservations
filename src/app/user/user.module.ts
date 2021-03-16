import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountInfoComponent } from './account-info/account-info.component';
import { HistoryComponent } from './history/history.component';
import { ReservationListComponent } from './reservation-list/reservation-list.component';
import { ReservationComponent } from '../components/reservation/reservation.component';
import { Routes, RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { SharedModule } from '../shared/shared.module';
import { UserAccountEffects } from './user.effects';
import { userAccountReducer } from './user.reducer';


const routes: Routes = [
  {
    path: '',
    component: AccountInfoComponent,
    pathMatch: 'full',
  },
  {
    path: 'reservations/:type',
    component: ReservationListComponent,
  },
  {
    path: 'reservations',
    redirectTo: 'reservations/current',
    pathMatch: 'full',
  },
]


@NgModule({
  declarations: [AccountInfoComponent, HistoryComponent, ReservationListComponent, ReservationComponent],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
    StoreModule.forFeature('userAccount', userAccountReducer),
    EffectsModule.forFeature([UserAccountEffects])
  ]
})
export class UserModule { }
