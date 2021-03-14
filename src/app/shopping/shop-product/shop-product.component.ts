import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AppState } from 'src/app/models/app-state';
import { Product } from 'src/app/models/product';
import { ShoppingActions } from '../shopping.action-types';
import { productTypesSelector } from '../shopping.selectors';

@Component({
  selector: 'app-shop-product',
  templateUrl: './shop-product.component.html',
  styleUrls: ['./shop-product.component.scss']
})
export class ShopProductComponent implements OnInit {
  productTypes$: Observable<Product[]>
  constructor(
    private store: Store<AppState>,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.store.dispatch(ShoppingActions.getPoductList())
    this.productTypes$ = this.store.select(productTypesSelector)
  }

}
