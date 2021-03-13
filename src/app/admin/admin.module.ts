import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SummaryComponent } from './summary/summary.component';
import { RouterModule, Routes } from '@angular/router';
import { AddProductTypeComponent } from './add-product-type/add-product-type.component';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { adminReducer } from './admin.reducer';
import { AdminEffects } from './admin.effects';
import { ProductTypeListComponent } from './product-type-list/product-type-list.component';

const routes: Routes = [
  {
    path: '',
    component: SummaryComponent,
    pathMatch: 'full',
  },
  {
    path: 'add-product',
    component: AddProductTypeComponent,
  },
]

@NgModule({
  declarations: [SummaryComponent, ProductTypeListComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    StoreModule.forFeature('admin', adminReducer),
    EffectsModule.forFeature([AdminEffects])
  ]
})
export class AdminModule { }
