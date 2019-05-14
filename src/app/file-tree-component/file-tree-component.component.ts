import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { DirTree } from '../../../main-files';
import { TreeComponent, TreeNode } from 'angular-tree-component';

@Component({
  selector: 'app-file-tree-component',
  templateUrl: './file-tree-component.component.html',
  styleUrls: ['./file-tree-component.component.scss']
})
export class FileTreeComponentComponent implements OnInit {
  @ViewChild(TreeComponent)
  private tree: TreeComponent;

  @Output() dirUpdate = new EventEmitter<string>();
  @Output() changeSubPath = new EventEmitter<string>();
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

  pathSelected(event: any) {
    console.log(event);
    this.changeSubPath.emit(event.node.data.id);
    this.dirUpdate.emit(event.node.data.id);
  }
}
