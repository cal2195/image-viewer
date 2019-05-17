import { Pipe, PipeTransform } from '@angular/core';
import { DirTreeElement } from '../../main-files';

@Pipe({
  name: 'tagFilterPipe'
})
export class TagFilterPipePipe implements PipeTransform {

  transform(items: DirTreeElement[], tags: string): any {
    if (!items || !tags || tags === '') {
      return items;
    }
    const searchTags = tags.split(' ');
    return items.filter((item) => {
      if (item.tags) {
        for (let i = 0; i < searchTags.length; i++) {
          const tag = searchTags[i];
          if (tag === '') {
            continue;
          }
          console.log(searchTags);
          console.log(item.tags);
          if (item.tags.indexOf(tag) === -1) {
            return false;
          }
        }
        return true;
      }
      return false;
    });
  }
}
