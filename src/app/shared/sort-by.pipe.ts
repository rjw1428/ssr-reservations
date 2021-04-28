import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sortBy'
})
export class SortByPipe implements PipeTransform {

  transform(value: any[], column: string = '', order = 'asc'): any[] {
    if (column == 'summarySpecial')
      return value.sort((a, b) => {
        try {
          const nameA = Object.values(a.value)[0]['name']
          const nameB = Object.values(b.value)[0]['name']
          return nameA.localeCompare(nameB)
        }
        catch (err) {
          console.log(err)
          return 0
        }
      })

    if (!value || order === '' || !order) { return value; } // no array
    if (value.length <= 1) { return value; } // array with only one item
    if (!column || column === '') {
      if (order === 'asc') { return value.sort() }
      else { return value.sort().reverse(); }
    }

    if (column == 'month') {
      const now = new Date()
      return value.sort((a, b) => {
        const aMonth = a['key'] <= now.getMonth()
          ? a['key'] + 12
          : a['key']
        const bMonth = b['key'] <= now.getMonth()
          ? b['key'] + 12
          : b['key']
        const aDate = new Date(now.getFullYear(), aMonth, 1)
        const bDate = new Date(now.getFullYear(), bMonth, 1)
        return aDate.getTime() - bDate.getTime()
      })
    }
    return order == 'asc'
      ? value.sort((a, b) => a[column] - b[column])
      : value.sort((a, b) => b[column] - a[column])
  }

}
