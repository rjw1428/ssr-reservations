import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { noop, Observable } from 'rxjs';
import { first, filter, find, map } from 'rxjs/operators';
import { AppActions } from 'src/app/app.action-types';
import { cachedProductListSelector } from 'src/app/app.selectors';
import { GenericPopupComponent } from 'src/app/components/generic-popup/generic-popup.component';
import { AppState } from 'src/app/models/app-state';
import { User } from 'src/app/models/user';
import { AdminActions } from '../admin.action-types';
import { userListSelector } from '../admin.selectors';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserListComponent implements OnInit {
  users$ = this.store.select(userListSelector)
  products$ = this.store.select(cachedProductListSelector)

  constructor(
    private store: Store<AppState>,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.users$.pipe(
      first(),
      filter(users => !users.length)
    ).subscribe(() => this.store.dispatch(AdminActions.getUserList()))

    this.products$.pipe(
      first(),
      filter(products => !products.length)
    ).subscribe(() => this.store.dispatch(AppActions.getProductTypes()))
  }

  onPromotion(userId: string) {
    this.store.dispatch(AdminActions.promote({ userId }))
  }

  onDemotion(userId: string, userList: User[]) {
    const remainingAdminAccounts = userList.filter(user => user.id !== userId && user.role === 'admin')
    remainingAdminAccounts.length > 0
      ? this.store.dispatch(AdminActions.demoteUser({ userId }))
      : this.dialog.open(GenericPopupComponent, {
        data: {
          title: "Can't Demote User...",
          content: "Need at least 1 Admin Account"
        }
      })
  }

  identify(index: number, item: User) {
    return item.id
  }
}
