import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { noop } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { AddProductTypeComponent } from 'src/app/admin/add-product-type/add-product-type.component';
import { AdminActions } from 'src/app/admin/admin.action-types';
import { userSelector } from 'src/app/app.selectors';
import { LoginComponent } from 'src/app/login/login.component';
import { AppState } from 'src/app/models/app-state';
import { Product } from 'src/app/models/product';
import { AddReservationComponent } from 'src/app/shopping/add-reservation/add-reservation.component';
import { TIMEFRAMES } from 'src/app/utility/constants';
import { GenericPopupComponent } from '../generic-popup/generic-popup.component';

@Component({
  selector: 'app-product-tile',
  templateUrl: './product-tile.component.html',
  styleUrls: ['./product-tile.component.scss']
})
export class ProductTileComponent implements OnInit {
  @Input() product: Product
  @Input() editable: boolean = false
  @Input() infoOnly: boolean = false
  timeframes: { value: string, label: string }[] = TIMEFRAMES
  user$ = this.store.select(userSelector)
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
    this.dialog.open(GenericPopupComponent, {
      data: {
        title: "Are you sure?",
        content: '<p>Are you sure you want to remove your remove this office type?. Current leases for this office type will not be canceled.</p>',
        actionLabel: 'Confirm',
        action: () => this.store.dispatch(AdminActions.removeProductType({ id: this.product.id }))
      }
    })
  }

  onReserve() {
    this.user$.pipe(
      first(),
      map(user => {
        const popup = !!user
          ? this.dialog.open(AddReservationComponent, { data: this.product })
          : this.dialog.open(LoginComponent, {
            width: '300px',
            data: {
              action: () => this.dialog.open(AddReservationComponent, { data: this.product })
            }
          })
        return popup.afterClosed()
      })
    ).subscribe(callback => callback)

  }
}
