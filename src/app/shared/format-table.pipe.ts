import { CurrencyPipe, DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { Transaction } from '../models/transaction';

@Pipe({
  name: 'formatTable'
})
export class FormatTablePipe implements PipeTransform {

  transform(value: Transaction[]): any[] {
    const currencyPipe = new CurrencyPipe('en-US')
    const datePipe = new DatePipe('en-US')
    return value.map(transaction => ({
      ...transaction,
      dateCreated: datePipe.transform(transaction.dateCreated, 'MM/dd'),
      dateDue: datePipe.transform(transaction.dateDue, 'MM/dd'),
      amount: currencyPipe.transform(transaction.amount),
    })
    )
  }
}
