import { Pipe, PipeTransform } from '@angular/core';
import { DirTreeElement } from '../../main-files';

@Pipe({
  name: 'imageLinker'
})
export class ImageLinkerPipe implements PipeTransform {

  transform(items: DirTreeElement[]): any {
    for (let i = 0; i < items.length; i++) {
      const current = items[i];
      if (i === 0) {
        current.prev = null;
        current.next = items[i+1];
      } else if (i === items.length - 1) {
        current.next = null;
        current.prev = items[i-1];
      } else {
        current.next = items[i+1];
        current.prev = items[i-1];
      }
    }
    return items;
  }

}
