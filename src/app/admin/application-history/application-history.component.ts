import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-application-history',
  templateUrl: './application-history.component.html',
  styleUrls: ['./application-history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApplicationHistoryComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
