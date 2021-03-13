import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AppActions } from 'src/app/app.action-types';
import { AdminState } from 'src/app/models/admin-state';
import { TIMEFRAMES } from 'src/app/utility/constants';
import { AdminActions } from '../admin.action-types';

@Component({
  selector: 'app-add-product-type',
  templateUrl: './add-product-type.component.html',
  styleUrls: ['./add-product-type.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddProductTypeComponent implements OnInit {
  productForm: FormGroup
  defaultCostForm: FormGroup
  availableTimeframes = TIMEFRAMES
  constructor(
    private formBuilder: FormBuilder,
    private store: Store<AdminState>
  ) { }

  ngOnInit(): void {
    this.productForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      count: ['', Validators.required],
      ...this.availableTimeframes.reduce((obj, timeframe) => {
        return { ...obj, [timeframe.value]: [0, Validators.required] }
      }, {})
    })

    this.availableTimeframes
  }

  onSave() {
    if (!this.productForm.valid) return
    const product = this.productForm.value
    this.store.dispatch(AppActions.startLoading())
    this.store.dispatch(AdminActions.saveProduct({ product }))
  }

}
