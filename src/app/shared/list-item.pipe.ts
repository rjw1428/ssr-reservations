import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'listItem'
})
export class ListItemPipe implements PipeTransform {

  transform(value: { [time: string]: string }, itemNum: number): number {
    return Object.keys(value).map(value => +value).sort()[itemNum]
  }

}
