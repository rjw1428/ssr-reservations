import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AppState } from 'src/app/models/app-state';
import { Product } from 'src/app/models/product';
import { AddProductTypeComponent } from '../add-product-type/add-product-type.component';
import { AdminActions } from '../admin.action-types';
import { productTypesSelector } from '../admin.selectors';

@Component({
  selector: 'app-product-type-list',
  templateUrl: './product-type-list.component.html',
  styleUrls: ['./product-type-list.component.scss']
})
export class ProductTypeListComponent implements OnInit {
  productTypes$: Observable<Product[]>
  constructor(
    private store: Store<AppState>,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.store.dispatch(AdminActions.getPoductList())
    this.productTypes$ = this.store.select(productTypesSelector)
  }

  onAdd() {
    this.dialog.open(AddProductTypeComponent, {
      data: null
    });

  }

}
