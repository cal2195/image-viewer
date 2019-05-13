import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { DirTree } from '../../../main-files';
import { TreeComponent } from 'angular-tree-component';

@Component({
  selector: 'app-file-tree-component',
  templateUrl: './file-tree-component.component.html',
  styleUrls: ['./file-tree-component.component.scss']
})
export class FileTreeComponentComponent implements OnInit {
  @ViewChild(TreeComponent)
  private tree: TreeComponent;

  @Output() dirUpdate = new EventEmitter<string>();
  @Output() updatePlz = new EventEmitter();

  @Input() dirTree;

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
