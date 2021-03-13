import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountInfoComponent } from './account-info/account-info.component';
import { HistoryComponent } from './history/history.component';
import { CurrentReservationsComponent } from './current-reservations/current-reservations.component';
import { ReservationComponent } from './current-reservations/reservation/reservation.component';



@NgModule({
  declarations: [AccountInfoComponent, HistoryComponent, CurrentReservationsComponent, ReservationComponent],
  imports: [
    CommonModule
  ]
})
export class UserModule { }
