import { Component, OnInit, ChangeDetectionStrategy, Input, OnChanges, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { of, Subscription } from 'rxjs';
import { filter, skip } from 'rxjs/operators';
import { AppActions } from 'src/app/app.action-types';
import { loginFeedbackSelector, newUserCreationBroadcastSelector } from 'src/app/app.selectors';
import { AppState } from 'src/app/models/app-state';
import { User } from 'src/app/models/user';
import { UserAccountActions } from 'src/app/user/user.action-types';

@Component({
  selector: 'app-user-data',
  templateUrl: './user-data.component.html',
  styleUrls: ['./user-data.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserDataComponent implements OnInit, OnDestroy {
  userAccount: FormGroup
  businessInfo: FormGroup
  @Input() user: User
  @Input() editable = false
  @Input() tirggerEmit: boolean
  @Output() value = new EventEmitter<{ error: string, resp: {} }>()
  feedback$ = this.store.select(loginFeedbackSelector)
  broadcast$ = this.store.select(newUserCreationBroadcastSelector).pipe(
    filter(val => !!val)
  )
  broadcastSub: Subscription
  constructor(
    private store: Store<AppState>,
    private formBuilder: FormBuilder
  ) { }

  ngOnDestroy() {
    this.store.dispatch(AppActions.setLoginFeedback(null))
    if (this.broadcastSub)
      this.broadcastSub.unsubscribe()
    this.store.dispatch(AppActions.broadcastNewUserCreation({ shouldBroadcast: false }))
  }

  ngOnInit(): void {
    this.initializeForms()

    this.broadcastSub = this.broadcast$.subscribe(() => {
      const event = this.userAccount.invalid || this.businessInfo.invalid
        ? {
          error: this.userAccount.invalid
            ? "Please complete all user information."
            : "Please complete all required business information.",
          resp: null
        }
        : {
          error: null,
          resp: this.userAccount.value
        }
      this.value.emit(event)
    })
  }

  onSave() {
    if (this.userAccount.invalid)
      return this.store.dispatch(AppActions.setLoginFeedback({ success: false, message: 'Please complete all user information.' }))
    if (this.businessInfo.invalid)
      return this.store.dispatch(AppActions.setLoginFeedback({ success: false, message: 'Please complete all required business information.' }))

    this.store.dispatch(AppActions.startLoading())
    const userData = { ...this.userAccount.value, id: this.user.id, ...this.businessInfo.value }
    this.store.dispatch(UserAccountActions.updateUserData({ userData }))
  }

  onCancel() {
    this.initializeForms()
  }

  initializeForms() {
    this.userAccount = this.formBuilder.group({
      firstName: [this.user ? this.user.firstName : '', Validators.required],
      lastName: [this.user ? this.user.lastName : '', Validators.required],
      email: [{ value: this.user ? this.user.email : '', disabled: !!this.user }, [Validators.required, Validators.email]],
      phone: [this.user ? this.user.phone : '', Validators.required]
    })
    this.businessInfo = this.formBuilder.group({
      businessName: [this.user ? this.user.businessName : '', Validators.required],
      address: [this.user ? this.user.address : ''],
      position: [this.user ? this.user.position : ''],
      size: [this.user ? this.user.size : ''],
      operatingHours: [this.user ? this.user.operatingHours : ''],
      sharedUserCount: [this.user ? this.user.sharedUserCount : '']
    })
  }

  // formatPhone() {
  //   return {
  //     link: function (scope, elem, attrs, ctrl, ngModel) {

  //       var COMMAND = 91;
  //       var BACKSPACE = 8;
  //       var DELETE = 46;
  //       var LEFT = 37;
  //       var RIGHT = 39;

  //       var $elem = $(elem);
  //       $elem.on('keydown', function (evt) {

  //         var charCode = (evt.which) ? evt.which : event.keyCode;
  //         // allow only numerical keys from the main and side number keyboard
  //         if (charCode != DELETE
  //           && charCode != BACKSPACE
  //           && charCode != COMMAND
  //           && charCode != LEFT
  //           && charCode != RIGHT
  //           && charCode > 31 && (charCode < 48 || charCode > 57) && (charCode < 96 || charCode > 105)) {
  //           return false;
  //         }

  //         //this condition is needed to allow proper backspace use
  //         if (charCode != 8) {
  //           var origVal = elem.val().replace(/[^\w\s]/gi, '');
  //           if (origVal.length === 3 || origVal.length === 6) {
  //             var phone = origVal.replace(/(.{3})/g, "$1-");
  //             $elem.val(phone);
  //           }
  //         }
  //       });

  //       $elem.attr("ng-minlength", 10);
  //       $elem.attr("minlength", 10);
  //       $elem.attr("ng-maxlength", 12);
  //       $elem.attr("maxlength", 12);
  //     }
  //   };
  // }

}
