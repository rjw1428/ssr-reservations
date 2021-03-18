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
    // CONFIRM
    this.store.dispatch(AdminActions.removeProductType({ id: this.product.id }))
  }

  onReserve() {
    this.user$.pipe(
      first(),
      map(user => {
        !!user
          ? this.dialog.open(AddReservationComponent, {
            data: this.product
          })
          : this.dialog.open(GenericPopupComponent, {
            width: '500px',
            data: {
              title: `Log In to Continue`,
              content: `<p>In order to reserve a workspace, you will need to log in or create an account.`,
              actionLabel: 'Continue',
              action: () => {
                this.dialog.open(LoginComponent, {
                  // maxWidth: '300px',
                  width: '300px'
                })
              }
            }
          })
      })
    ).subscribe(noop)

  }
}
