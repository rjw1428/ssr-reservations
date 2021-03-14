import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { AddProductTypeComponent } from 'src/app/admin/add-product-type/add-product-type.component';
import { AdminActions } from 'src/app/admin/admin.action-types';
import { AppState } from 'src/app/models/app-state';
import { Product } from 'src/app/models/product';
import { AddReservationComponent } from 'src/app/shopping/add-reservation/add-reservation.component';
import { TIMEFRAMES } from 'src/app/utility/constants';

@Component({
  selector: 'app-product-tile',
  templateUrl: './product-tile.component.html',
  styleUrls: ['./product-tile.component.scss']
})
export class ProductTileComponent implements OnInit {
  @Input() product: Product
  @Input() editable: boolean = false
  timeframes: { value: string, label: string }[] = TIMEFRAMES
  constructor(
    private store: Store<AppState>,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
  }

  onEdit() {
    this.dialog.open(AddProductTypeComponent, {
      data: this.product
    });
  }

  onRemove() {
    // CONFIRM
    this.store.dispatch(AdminActions.removeProductType({ id: this.product.id }))
  }

  onReserve() {
    this.dialog.open(AddReservationComponent, {
      data: this.product
    })
  }
}
