import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { noop, Observable } from 'rxjs';
import { filter, first, map } from 'rxjs/operators';
import { AdminActions } from 'src/app/admin/admin.action-types';
import { activeProductListSelector, cachedProductListSelector } from 'src/app/app.selectors';
import { AppState } from 'src/app/models/app-state';
import { Product } from 'src/app/models/product';
import { ShoppingActions } from '../shopping.action-types';

@Component({
  selector: 'app-shop-product',
  templateUrl: './shop-product.component.html',
  styleUrls: ['./shop-product.component.scss']
})
export class ShopProductComponent implements OnInit {
  productTypes$ = this.store.select(activeProductListSelector)
  constructor(
    private store: Store<AppState>,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.productTypes$.pipe(
      first(),
      filter(products => !products.length)
    ).subscribe(() => this.store.dispatch(ShoppingActions.getPoductList()))
  }

}
