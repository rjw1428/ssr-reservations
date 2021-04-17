import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, first } from 'rxjs/operators';
import { activeProductListSelector, cachedProductListSelector } from 'src/app/app.selectors';
import { AppState } from 'src/app/models/app-state';
import { Product } from 'src/app/models/product';
import { AddProductTypeComponent } from '../add-product-type/add-product-type.component';
import { AdminActions } from '../admin.action-types';

@Component({
  selector: 'app-product-type-list',
  templateUrl: './product-type-list.component.html',
  styleUrls: ['./product-type-list.component.scss']
})
export class ProductTypeListComponent implements OnInit {
  productTypes$ = this.store.select(activeProductListSelector)
  constructor(
    private store: Store<AppState>,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.productTypes$.pipe(
      first(),
      filter(products => !products.length)
    ).subscribe(() => this.store.dispatch(AdminActions.getPoductList()))
  }

  onAdd() {
    this.dialog.open(AddProductTypeComponent, {
      data: null
    });

  }

}
