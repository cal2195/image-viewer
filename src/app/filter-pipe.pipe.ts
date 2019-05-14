import { Pipe, PipeTransform } from '@angular/core';
import { DirTreeElement } from '../../main-files';

@Pipe({
  name: 'filterPipe'
})
export class FilterPipePipe implements PipeTransform {

  transform(items: DirTreeElement[], subPath: string): any {
    console.log('filtering by path: %s', subPath);
    return items.filter((item) => {
      if (item.name.endsWith('.jpg') && item.path === subPath) {
        return true;
      }
      return false;
    });
  }
}
