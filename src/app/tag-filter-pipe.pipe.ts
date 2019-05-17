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
        return this.hasTag(item.tags, searchTags);
      } else {
        return this.hasTag(item.path + '/' + item.name, searchTags);
      }
      return false;
    });
  }

  hasTag(entryTags: string, searchTags: string[]): boolean {
    let atLeastOne = false;
    for (let i = 0; i < searchTags.length; i++) {
      const tag = searchTags[i];
      if (tag === '' || tag === '-') {
        continue;
      }
      if (tag.charAt(0) === '+') {
        // console.log('must include %s', tag);
        atLeastOne = true;
        if (entryTags.indexOf(tag.substring(1)) === -1) {
          return false;
        }
      } else if (tag.charAt(0) === '-') {
        // console.log('must not include %s', tag);
        atLeastOne = true;
        if (entryTags.indexOf(tag.substring(1)) !== -1) {
          return false;
        }
      } else {
        // console.log('can include %s', tag);
        if (entryTags.indexOf(tag) !== -1) {
          atLeastOne = true;
        }
      }
    }
    return atLeastOne;
  }
}
