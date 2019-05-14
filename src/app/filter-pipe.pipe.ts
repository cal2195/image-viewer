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
    return items.filter((item) => {
      if (item.name.endsWith('.jpg')) {
        return (recursive && item.path.startsWith(subPath)) || (!recursive && item.path === subPath);
      }
      return false;
    });
  }
}
