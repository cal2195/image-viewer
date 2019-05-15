import { Component, OnInit, Input } from '@angular/core';
import { DirTreeElement } from '../../../main-files';

@Component({
  selector: 'app-thumbnail-component',
  templateUrl: './thumbnail-component.component.html',
  styleUrls: ['./thumbnail-component.component.scss']
})
export class ThumbnailComponentComponent implements OnInit {

  @Input() element: DirTreeElement;
  @Input() rootFolder: string;
  @Input() cachePath: string;
  @Input() thumbUpdate: boolean;

  path: string;

  constructor() { }

  ngOnInit() {
    this.path = 'file://' + this.cachePath + this.element.hash + '.jpg';
  }

}
