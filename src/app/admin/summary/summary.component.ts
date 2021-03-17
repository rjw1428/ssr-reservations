import { trigger, state, style, transition, animate } from '@angular/animations';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { AppState } from 'src/app/models/app-state';
import { ProductSummary } from 'src/app/models/product-summary';
import { AdminActions } from '../admin.action-types';
import { adminSummarySelector } from '../admin.selectors';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class SummaryComponent implements OnInit {
  adminSummary$ = this.store.select(adminSummarySelector).pipe(shareReplay())
  constructor(
    private store: Store<AppState>
  ) { }

  ngOnInit(): void {
    this.store.dispatch(AdminActions.getAdminSummary())
  }

}
