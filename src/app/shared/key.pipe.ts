import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'key'
})
export class KeyPipe implements PipeTransform {

  transform(value: {}): any[] {
    return value
      ? Object.keys(value)
      : []
  }

}
