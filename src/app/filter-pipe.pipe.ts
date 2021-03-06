import { Pipe, PipeTransform } from '@angular/core';
import { DirTreeElement, imageRegex } from '../../main-files';

@Pipe({
  name: 'filterPipe'
})
export class FilterPipePipe implements PipeTransform {

  transform(items: DirTreeElement[], subPath: string, recursive: boolean): any {
    if (!items) {
      return;
    }
    items = items.filter((item) => {
      if (item.name.toLowerCase().match(imageRegex)) {
        return (recursive && item.path.startsWith(subPath)) || (!recursive && item.path === subPath);
      }
      return false;
    }).sort((a, b) => {
      let result = a.path.localeCompare(b.path);
      if (result === 0) {
        result =  a.name.localeCompare(b.name);
      }
      return result;
    });
    return items;
  }
}
