import { Component, OnInit, Input } from '@angular/core';
import { DirTreeElement } from '../../../main-files';

@Component({
  selector: 'app-thumbnail-component',
  templateUrl: './thumbnail-component.component.html',
  styleUrls: ['./thumbnail-component.component.scss']
})
export class ThumbnailComponentComponent implements OnInit {

  @Input() element: DirTreeElement;

  constructor() { }

  ngOnInit() {
  }

}
