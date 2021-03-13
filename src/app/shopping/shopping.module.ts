import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShopProductComponent } from './shop-product/shop-product.component';
import { ProductTileComponent } from './shop-product/product-tile/product-tile.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: ShopProductComponent,
  },
]

@NgModule({
  declarations: [ShopProductComponent, ProductTileComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class ShoppingModule { }
