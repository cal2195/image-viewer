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

  private _dirTree: any;

  get dirTree(): any {
    return this._dirTree;
  }

  @Input()
  set dirTree(tree: any) {
    this._dirTree = tree;
    this.tree.sizeChanged();
  }

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
