import { AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-redirect',
  templateUrl: './generic-popup.component.html',
  styleUrls: ['./generic-popup.component.scss']
})
export class GenericPopupComponent implements OnInit, AfterViewInit {
  @ViewChild('content') contentRef: ElementRef
  constructor(
    @Inject(MAT_DIALOG_DATA) public input: { title: string, content: string },
  ) { }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    this.contentRef.nativeElement.innerHTML = this.input.content
  }

}
