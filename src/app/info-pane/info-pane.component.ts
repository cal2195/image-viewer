import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-info-pane',
  templateUrl: './info-pane.component.html',
  styleUrls: ['./info-pane.component.scss']
})
export class InfoPaneComponent implements OnInit {

  @Input() tags: string;
  @Output() tagClicked = new EventEmitter<string>();

  tagList: string[];

  constructor() { }

  ngOnInit() {
    this.tagList = this.tags.split(' ');
  }

}
