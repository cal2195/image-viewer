import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TagFreq } from '../tag-freq.service';
import { DirTreeElement } from '../../../main-files';

@Component({
  selector: 'app-info-pane',
  templateUrl: './info-pane.component.html',
  styleUrls: ['./info-pane.component.scss']
})
export class InfoPaneComponent implements OnInit {

  @Input() currentImage: DirTreeElement;
  @Input() tagFreq: TagFreq;
  @Output() tagClicked = new EventEmitter<string>();


  constructor() { }

  ngOnInit() {
  }

}
