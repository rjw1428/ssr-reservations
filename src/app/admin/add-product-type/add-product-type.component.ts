import { ChangeDetectionStrategy, Component, HostListener, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, first, skip } from 'rxjs/operators';
import { AppActions } from 'src/app/app.action-types';
import { loadingSelector } from 'src/app/app.selectors';
import { AdminState } from 'src/app/models/admin-state';
import { Product } from 'src/app/models/product';
import { LEASETYPES, TIMEFRAMES } from 'src/app/utility/constants';
import { AdminActions } from '../admin.action-types';

@Component({
  selector: 'app-add-product-type',
  templateUrl: './add-product-type.component.html',
  styleUrls: ['./add-product-type.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddProductTypeComponent implements OnInit {
  productForm: FormGroup
  availableTimeframes = TIMEFRAMES
  leaseTypes = LEASETYPES
  constructor(
    public dialogRef: MatDialogRef<AddProductTypeComponent>,
    @Inject(MAT_DIALOG_DATA) public inputProduct: Product,
    private formBuilder: FormBuilder,
    private store: Store<AdminState>,
  ) { }

  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key == 'Enter' && this.productForm && this.productForm.valid)
      this.onSave()
  }

  ngOnInit(): void {
    const timeFrameFormInit = this.availableTimeframes.reduce((obj, timeframe) => {
      const initialValue = this.inputProduct
        ? this.inputProduct[timeframe.value]
        : 0
      return {
        ...obj,
        [timeframe.value]: [initialValue, Validators.required]
      }
    }, {})

    this.productForm = this.formBuilder.group({
      name: [this.inputProduct ? this.inputProduct.name : '', Validators.required],
      description: [this.inputProduct ? this.inputProduct.description : '', Validators.required],
      count: [this.inputProduct ? this.inputProduct.count : '', Validators.required],
      ...timeFrameFormInit,
      leaseOptions: this.formBuilder.group(this.leaseTypes.reduce((group, option) => {
        const initialValue = this.inputProduct
          ? this.inputProduct.leaseOptions.includes(option.id)
          : false
        return { ...group, [option.id]: [initialValue] }
      }, {}))
    })
  }

  onSave() {
    if (!this.productForm.valid) return

    this.store.dispatch(AppActions.startLoading())

    const { leaseOptions, ...productFormVals } = this.productForm.value
    // ADDING NEW PRODUCT
    if (!this.inputProduct) {
      const product: Product = {
        ...productFormVals,
        dateCreated: new Date().getTime(),
        isActive: true,
        leaseOptions: Object.keys(leaseOptions).filter(key => leaseOptions[key])
      }
      this.store.dispatch(AdminActions.saveProduct({ product }))
    }
    // EDITING PRODUCT
    else {
      const updatedProduct: Product = {
        ...this.inputProduct,
        ...this.productForm.value,
        dateCreated: new Date().getTime(),
        leaseOptions: Object.keys(leaseOptions).filter(key => leaseOptions[key])
      }
      this.store.dispatch(AdminActions.editProduct({ updatedProduct }))
    }

    // LISTEN FOR WRITE SUCCESS (CLOSE FORM)
    this.store.select(loadingSelector).pipe(
      skip(1),
      first(),
      filter((isSaving: boolean) => !isSaving)
    ).subscribe(isStillSaving => {
      if (!isStillSaving)
        this.dialogRef.close()
    })
  }

  onCancel() {
    this.dialogRef.close()
  }

}

