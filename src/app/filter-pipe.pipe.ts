import { Pipe, PipeTransform } from '@angular/core';
import { DirTreeElement } from '../../main-files';

@Pipe({
  name: 'filterPipe'
})
export class FilterPipePipe implements PipeTransform {

  transform(items: DirTreeElement[], subPath: string, recursive: boolean): any {
    if (!items) {
      return;
    }
    items = items.filter((item) => {
      if (item.name.endsWith('.jpg')) {
        return (recursive && item.path.startsWith(subPath)) || (!recursive && item.path === subPath);
      }
      return false;
    });

    for (let i = 0; i < items.length; i++) {
      const current = items[i];
      current.next = items[i+1];
      current.prev = items[i-1];
    }

    return items;
  }
}
