import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { MatStep } from '@angular/material/stepper';
import { Store } from '@ngrx/store';
import { combineLatest, iif, Observable, of, Subscription, zip } from 'rxjs';
import { filter, first, map, mergeMap, shareReplay, skip, startWith, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { CalendarHeaderComponent } from 'src/app/components/calendar-header/calendar-header.component';
import { AdminState } from 'src/app/models/admin-state';
import { Product } from 'src/app/models/product';
import { Reservation } from 'src/app/models/reservation';
import { ShoppingState } from 'src/app/models/shopping-state';
import { BOOKTIMES } from 'src/app/utility/constants';
import { ShoppingActions } from '../shopping.action-types';
import { reservationModeSelector, reservationSubmissionSuccessSelector } from '../shopping.selectors';

@Component({
  selector: 'app-add-reservation',
  templateUrl: './add-reservation.component.html',
  styleUrls: ['./add-reservation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddReservationComponent implements OnInit, OnDestroy {
  datePickerHeader = CalendarHeaderComponent
  startTimes = BOOKTIMES
  endTimes = BOOKTIMES
  singleDayForm: FormGroup
  multiDayForm: FormGroup

  // hours$: Observable<number>
  // days$: Observable<number>
  time$: Observable<number>
  subtotal$: Observable<number>
  taxes$: Observable<number>
  fees$: Observable<number>
  total$: Observable<number>

  feePercent = 0.02
  taxRate = 0.05
  submissionMode$: Observable<string>
  submissionSuccess$: Observable<boolean>

  test: Subscription
  constructor(
    public dialogRef: MatDialogRef<AddReservationComponent>,
    @Inject(MAT_DIALOG_DATA) public inputProduct: Product,
    private formBuilder: FormBuilder,
    private store: Store<ShoppingState>,
  ) { }

  ngOnDestroy() {
    console.log("DESTROY")
    if (this.test)
      this.test.unsubscribe()
  }

  ngOnInit(): void {
    this.singleDayForm = this.formBuilder.group({
      day: ['', Validators.required],
      startHour: ['', Validators.required],
      endHour: ['', Validators.required]
    })

    this.multiDayForm = this.formBuilder.group({
      startDay: ['', Validators.required],
      endDay: ['', Validators.required]
    })

    this.submissionMode$ = this.store.select(reservationModeSelector).pipe(tap(console.log))

    const singleFormTime$ = this.singleDayForm.valueChanges.pipe(
      map(formValues => formValues.endHour && formValues.startHour ? (formValues.endHour - formValues.startHour) / (1000 * 60 * 60) : 0),
      shareReplay()
    )
    const multiFormTime$ = this.multiDayForm.valueChanges.pipe(
      map(formValues => formValues.endDay && formValues.startDay ? (formValues.endDay.getTime() - formValues.startDay.getTime()) / (1000 * 60 * 60 * 24) : 0),
      shareReplay()
    )
    // USED IN SUMMARY
    this.time$ = this.store.select(reservationModeSelector).pipe(
      switchMap(mode => iif(() => mode == 'single', singleFormTime$, multiFormTime$)),
      shareReplay(),
      startWith(0),
    )

    this.subtotal$ = this.store.select(reservationModeSelector).pipe(
      switchMap(mode => {
        if (mode == 'single')
          return this.singleDayForm.valueChanges.pipe(
            filter(formValues => formValues.endHour && formValues.startHour),
            map(formValues => this.getSingleDayCost(formValues.startHour, formValues.endHour))
          )
        else
          return this.multiDayForm.valueChanges.pipe(
            filter(formValues => formValues.endDay && formValues.startDay),
            map(formValues => this.getMultiDayCost(formValues.startDay, formValues.endDay))
          )
      }),
      startWith(0),
    )
    // this.subtotal$ = this.store.select(reservationModeSelector).pipe(
    //   switchMap(mode => iif(() => mode == 'single',
    //     singleFormTime$.pipe(map(delta => delta * this.inputProduct.hour), shareReplay()),
    //     multiFormTime$.pipe(map(delta => delta * this.inputProduct.day), shareReplay())
    //   )),
    //   startWith(0),
    //   shareReplay()
    // )
    this.fees$ = this.subtotal$.pipe(map(subtotal => subtotal * this.feePercent), shareReplay())
    this.taxes$ = this.subtotal$.pipe(map(subtotal => subtotal * this.taxRate), shareReplay())

    this.total$ = zip(this.subtotal$, this.fees$, this.taxes$).pipe(
      map(values => values.reduce((total, num) => total + num, 0))
    )

    this.total$.subscribe(console.log)
    this.submissionSuccess$ = this.store.select(reservationSubmissionSuccessSelector).pipe(skip(1))
  }

  onModeSelected(event: { selectedStep: MatStep, selectedIndex: number }) {
    this.singleDayForm.reset({ day: '', startHour: '', endHour: '' }, { emitEvent: false })
    this.multiDayForm.reset({ startDay: '', endDay: '' }, { emitEvent: false })
    this.store.dispatch(ShoppingActions.setReservationMode({ mode: event.selectedStep.state }))
  }

  onContinue() {
    this.store.select(reservationModeSelector).pipe(
      first(),
      map(submissionMode => {
        if (submissionMode == 'single') {
          if (!this.singleDayForm.valid) {
            console.log("SINGLEFORM INVALID")
            return
          }
          const day: Date = this.singleDayForm.get('day').value
          const startTime: number = day.getTime() + this.singleDayForm.get('startHour').value
          const endTime: number = day.getTime() + this.singleDayForm.get('endHour').value
          const subtotal = this.getSingleDayCost(startTime, endTime)
          const cost = subtotal + subtotal * this.feePercent + subtotal * this.taxRate
          return { startTime, endTime, cost }
        }
        else {
          if (!this.multiDayForm.valid) {
            console.log("MULTIFORM INVALID")
            return
          }
          const { startDay, endDay }: { startDay: Date, endDay: Date } = this.multiDayForm.value
          const subtotal = this.getMultiDayCost(startDay, endDay)
          const cost = subtotal + subtotal * this.feePercent + subtotal * this.taxRate
          return { startTime: startDay.getTime(), endTime: endDay.getTime(), cost }
        }
      }),
      map(({ startTime, endTime, cost }) => {
        const reservation: Reservation = {
          userId: 'test123',
          spaceId: this.inputProduct.id,
          startTime,
          endTime,
          createdTime: new Date().getTime(),
          lastModifiedTime: new Date().getTime(),
          cost
        }
        return reservation
      })
    ).subscribe(
      reservation => this.store.dispatch(ShoppingActions.saveReservation({ reservation })),
      err => console.log(err),
      () => console.log("COMPLETE")
    )

    // LISTEN FOR WRITE SUCCESS (CLOSE FORM)
    this.submissionSuccess$.pipe(
      first(),
      filter((isSaving: boolean) => !isSaving)
    ).subscribe(isStillSaving => {
      if (!isStillSaving)
        this.dialogRef.close()
    })



    // NEED TO FIGURE OUT COST FOR MULTI DAY
    // const startDay: Date = this.multiDayForm.get('startDay').value
    // const endDay: Date = this.multiDayForm.get('endDay').value
    // const months = endDay.getMonth() - startDay.getMonth()
    // const dayDiff = endDay.getDate() - startDay.getDate()
    // const weeks = Math.floor(dayDiff / 7)
    // const days = dayDiff % 7
  }

  setEndTimes(event: MatSelectChange) {
    const maxIndex = this.startTimes.findIndex(time => time.value == event.value)
    this.endTimes = this.startTimes.slice(maxIndex + 1)
  }

  getMultiDayCost(startDay: Date, endDay: Date): number {
    const time = (endDay.getTime() - startDay.getTime()) / (1000 * 60 * 60 * 24)
    return time * this.inputProduct.day
  }

  getSingleDayCost(startHour: number, endHour: number): number {
    const time = (endHour - startHour) / (1000 * 60 * 60)
    return time * this.inputProduct.hour
  }

}
