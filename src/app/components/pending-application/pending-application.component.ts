import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppActions } from 'src/app/app.action-types';
import { userSelector } from 'src/app/app.selectors';
import { AdminState } from 'src/app/models/admin-state';
import { Reservation } from 'src/app/models/reservation';

@Component({
  selector: 'app-pending-application',
  templateUrl: './pending-application.component.html',
  styleUrls: ['./pending-application.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PendingApplicationComponent implements OnInit {
  @Input() application: Reservation
  @Input() admin: boolean = false
  @Output() accept = new EventEmitter()
  @Output() reject = new EventEmitter()
  constructor(
    private store: Store<AdminState>
  ) { }

  ngOnInit(): void {
  }

  onReject() {
    this.reject.emit()
  }

  onAccept() {
    this.accept.emit()
  }
}
