import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DirTree } from '../../../main-files';

@Component({
  selector: 'app-file-tree-component',
  templateUrl: './file-tree-component.component.html',
  styleUrls: ['./file-tree-component.component.scss']
})
export class FileTreeComponentComponent implements OnInit {
  @Input() dirTree: any;
  @Output() dirUpdate = new EventEmitter<string>();

  options = {
    getChildren: (node: any) => {
      console.log('updatedir');
      console.log(node);
      this.dirUpdate.emit(node.data.path + '/' + node.data.name);
    }
  };

  constructor() { }

  ngOnInit() {
  }
}
