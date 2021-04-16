import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sortBy'
})
export class SortByPipe implements PipeTransform {

  transform(value: any[], column: string = '', order = 'asc'): any[] {
    if (!value || order === '' || !order) { return value; } // no array
    if (value.length <= 1) { return value; } // array with only one item
    if (!column || column === '') {
      if (order === 'asc') { return value.sort() }
      else { return value.sort().reverse(); }
    }

    return order == 'asc'
      ? value.sort((a, b) => a[column] - b[column])
      : value.sort((a, b) => b[column] - a[column])
  }

}
