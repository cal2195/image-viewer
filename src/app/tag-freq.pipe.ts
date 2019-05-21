import { Pipe, PipeTransform } from '@angular/core';
import { TagFreqService } from './tag-freq.service';
import { DirTreeElement } from '../../main-files';

@Pipe({
  name: 'tagFreq'
})
export class TagFreqPipe implements PipeTransform {

  constructor(
    public tagFreqService: TagFreqService
  ) { }

  transform(items: DirTreeElement[]): any {
    if (!items || items.length === 0) {
      return items;
    }
    this.tagFreqService.resetMap();

    items.forEach((item) => {
      if (item.tags) {
        this.tagFreqService.addString(item.tags + ' ' + item.name);
      } else {
        this.tagFreqService.addString(item.name);
      }
    });

    this.tagFreqService.computeFrequencyArray(items.length, 100);

    return items;
  }

}
