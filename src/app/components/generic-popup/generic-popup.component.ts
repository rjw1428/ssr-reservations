import { AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-redirect',
  templateUrl: './generic-popup.component.html',
  styleUrls: ['./generic-popup.component.scss']
})
export class GenericPopupComponent implements OnInit, AfterViewInit {
  @ViewChild('content') contentRef: ElementRef
  dataForm: FormGroup
  constructor(
    private dialogRef: MatDialogRef<GenericPopupComponent>,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public input: {
      title: string,
      content: string,
      actionLabel: string,
      action?: () => any
      form?: string[]
    },
  ) { }

  ngOnInit(): void {
    if (this.input.form) {
      const fg = this.input.form
        .map(id => ({ [id]: [''] }))
        .reduce((acc, cur) => ({ ...acc, ...cur }))
      this.dataForm = this.formBuilder.group(fg)
    }
  }

  ngAfterViewInit(): void {
    if (!this.input.form)
      this.contentRef.nativeElement.innerHTML = this.input.content
  }

  triggerAction() {
    this.dataForm
      ? this.dialogRef.close({action: this.input.action(), ...this.dataForm.value})
      : this.dialogRef.close(this.input.action())
    
  }
}
