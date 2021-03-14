import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShopProductComponent } from './shop-product/shop-product.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { ShoppingEffects } from './shopping.effects';
import { shoppingReducer } from './shopping.reducer';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { AddReservationComponent } from './add-reservation/add-reservation.component';

const routes: Routes = [
  {
    path: '',
    component: ShopProductComponent,
  },
]

@NgModule({
  declarations: [ShopProductComponent, AddReservationComponent],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
    StoreModule.forFeature('shopping', shoppingReducer),
    EffectsModule.forFeature([ShoppingEffects])
  ]
})
export class ShoppingModule { }
