import { Component, OnInit, Input } from '@angular/core';
import { DirTree } from '../../../main-files';

@Component({
  selector: 'app-file-tree-component',
  templateUrl: './file-tree-component.component.html',
  styleUrls: ['./file-tree-component.component.scss']
})
export class FileTreeComponentComponent implements OnInit {
  @Input() dirTree: any;

  options = {};

  constructor() { }

  ngOnInit() {
  }
}
