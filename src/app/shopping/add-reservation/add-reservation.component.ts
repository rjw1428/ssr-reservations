import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { MatStep } from '@angular/material/stepper';
import { Store } from '@ngrx/store';
import { combineLatest, iif, Observable, of, Subscription, zip } from 'rxjs';
import { filter, find, first, map, mergeMap, shareReplay, skip, startWith, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { userSelector } from 'src/app/app.selectors';
import { CalendarHeaderComponent } from 'src/app/components/calendar-header/calendar-header.component';
import { AdminState } from 'src/app/models/admin-state';
import { Product } from 'src/app/models/product';
import { Reservation } from 'src/app/models/reservation';
import { ShoppingState } from 'src/app/models/shopping-state';
import { Space } from 'src/app/models/space';
import { UserAccountActions } from 'src/app/user/user.action-types';
import { BOOKTIMES, LEASETYPES, MONTHS } from 'src/app/utility/constants';
import { ShoppingActions } from '../shopping.action-types';
import { availableSpacesSelector, reservationModeSelector, reservationSubmissionSuccessSelector } from '../shopping.selectors';

@Component({
  selector: 'app-add-reservation',
  templateUrl: './add-reservation.component.html',
  styleUrls: ['./add-reservation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddReservationComponent implements OnInit, OnDestroy {
  datePickerHeader = CalendarHeaderComponent

  timeFrameForm: FormGroup
  months = MONTHS
  leaseTypes = LEASETYPES
  startDate$: Observable<number>
  endDate$: Observable<number>

  selectSpaceForm: FormGroup
  selectedLeaseType$: Observable<{ id: string, label: string, number: number }>
  time$: Observable<number>
  subtotal$: Observable<number>
  taxes$: Observable<number>
  fees$: Observable<number>
  total$: Observable<number>
  selectedSpace$: Observable<Space>

  submissionMode$: Observable<string>
  submissionSuccess$: Observable<boolean>
  availableSpaces$ = this.store.select(availableSpacesSelector)
  reservation$: Observable<Reservation>

  readonly feePercent = 0.02
  readonly taxRate = 0.05

  constructor(
    public dialogRef: MatDialogRef<AddReservationComponent>,
    @Inject(MAT_DIALOG_DATA) public inputProduct: Product,
    private formBuilder: FormBuilder,
    private store: Store<ShoppingState>,
  ) { }

  ngOnDestroy() {
    console.log("DESTROY")
  }

  ngOnInit(): void {
    this.timeFrameForm = this.formBuilder.group({
      leaseType: ['', Validators.required],
      startMonth: ['', Validators.required]
    })

    this.selectSpaceForm = this.formBuilder.group({
      space: ['', Validators.required],
    })

    this.selectedSpace$ = this.availableSpaces$.pipe(map(spaces => spaces.find(space => space.id == this.selectSpaceForm.value['space'])))

    this.startDate$ = this.timeFrameForm.get('startMonth').valueChanges.pipe(
      map(monthNum => {
        const now = new Date()
        const tempDate = new Date(now.getFullYear(), +monthNum, 1).getTime()
        return tempDate < now.getTime()
          ? new Date(now.getFullYear(), (+monthNum + 12), 1).getTime()
          : tempDate
      }),
      shareReplay()
    )
    this.endDate$ = this.startDate$.pipe(map(startDate => {
      const delta = this.leaseTypes.find(lease => lease.id == this.timeFrameForm.get('leaseType').value).number
      const start = new Date(startDate)
      return new Date(start.getFullYear(), start.getMonth() + delta, 1).getTime()
    }), shareReplay())

    this.selectedLeaseType$ = this.timeFrameForm.get('leaseType').valueChanges.pipe(
      map(leaseId => this.leaseTypes.find(lease => lease.id == leaseId))
    )

    this.subtotal$ = this.selectedLeaseType$.pipe(
      map(lease => lease.number * this.inputProduct.month),
      startWith(0),
      shareReplay()
    )

    this.fees$ = this.subtotal$.pipe(map(subtotal => subtotal * this.feePercent), shareReplay())
    this.taxes$ = this.subtotal$.pipe(map(subtotal => subtotal * this.taxRate), shareReplay())

    this.total$ = zip(this.subtotal$, this.fees$, this.taxes$).pipe(
      map(values => values.reduce((total, num) => total + num, 0)),
      shareReplay(1)
    )

    this.submissionSuccess$ = this.store.select(reservationSubmissionSuccessSelector).pipe(skip(1))
  }


  queryAvailability() {
    combineLatest([this.startDate$, this.endDate$]).pipe(first())
      .subscribe(([startDate, endDate]) =>
        this.store.dispatch(ShoppingActions.queryAvailability({ startDate, endDate, productId: this.inputProduct.id }))
      )
  }

  createTempReservation() {
    const { space } = this.selectSpaceForm.value
    const user$ = this.store.select(userSelector)
    this.reservation$ = combineLatest([user$, this.startDate$, this.endDate$, this.total$])
      .pipe(
        first(),
        map(([user, startDate, endDate, totalCost]) => {
          const now = new Date().getTime()
          const reservation: Reservation = {
            userId: user.id,
            productId: this.inputProduct.id,
            spaceId: space,
            startDate,
            endDate,
            createdTime: now,
            lastModifiedTime: now,
            totalCost,
            cost: this.inputProduct.month,
            status: "pending"
          }
          return reservation
        })
      )
  }

  submitApplication(reservation) {
    this.store.dispatch(ShoppingActions.saveReservation({ reservation }))


    // LISTEN FOR WRITE SUCCESS (CLOSE FORM)
    this.submissionSuccess$.pipe(
      first(),
      filter((isSaving: boolean) => !isSaving)
    ).subscribe(isStillSaving => {
      if (!isStillSaving)
        this.dialogRef.close()
    })
  }
}
