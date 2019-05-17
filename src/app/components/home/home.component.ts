import { Component, OnInit, ChangeDetectorRef, HostListener, ViewChild } from '@angular/core';
import { ElectronService } from '../../providers/electron.service';
import { DirTree, DirTreeElement, DirTreeNode } from '../../../../main-files';
import { FileTreeComponentComponent } from '../../file-tree-component/file-tree-component.component';
import { VirtualScrollerComponent } from 'ngx-virtual-scroller';
import { rootRenderNodes } from '@angular/core/src/view';
const async = require('async');

export enum KEY_CODE {
  RIGHT_ARROW = 39,
  LEFT_ARROW = 37
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  @ViewChild(FileTreeComponentComponent)
  private treeview: FileTreeComponentComponent;
  @ViewChild(VirtualScrollerComponent)
  private virtualScroller: VirtualScrollerComponent;

  updateQueue = async.queue(async (task, callback) => {
    let newPaths = this.root.paths.slice(0);
    newPaths = this.removeBySubpath(newPaths, task.parentPath + '/' + task.parentNode.name);
    newPaths = newPaths.concat(task.paths);
    this.root.paths = newPaths;
    this.insertUpdatedNode(task.parentPath, task.parentNode);
    this.dirtyTree = true;
    callback();
  }, 1);

  sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis));
  }

  root: DirTree = null;
  displayTreeRoot: DirTreeNode[];
  displayPaths: DirTreeElement[];
  dirtyTree = false;
  selectedSubPath: string;
  recursive = false;
  currentImage: DirTreeElement;
  thumbUpdate: boolean[] = [];

  searchString = '';

  constructor(
    public electronService: ElectronService,
    private cdr: ChangeDetectorRef) {}

  resetTreeTimer() {
    setTimeout(() => {
      if (this.dirtyTree) {
        this.dirtyTree = false;
        this.displayTreeRoot = this.root.tree;
        this.displayPaths = this.root.paths;
        this.treeview.tree.treeModel.update();
        console.log('updating screen');
        this.cdr.detectChanges();
      }
      this.resetTreeTimer();
    }, 1000);
  }


  ngOnInit() {
    window.onbeforeunload = (e) => {
      console.log('I do not want to be closed');

      this.electronService.ipcRenderer.send('save-root-file', this.root);
      e.returnValue = false; // equivalent to `return false` but not recommended
    };
    // this.updateQueue.drain = () => {
    //   this.treeview.tree.treeModel.update();
    //   console.log('updating screen');
    //   this.cdr.detectChanges();
    // }
    this.electronService.ipcRenderer.on('root-init', (event, root) => {
      this.root = root;
      this.displayTreeRoot = this.root.tree;
      this.displayPaths = this.root.paths;
      this.resetTreeTimer();
      this.cdr.detectChanges();
    });
    this.electronService.ipcRenderer.on('node-update', (event, parentPath, parentNode, paths) => {
      const task = {parentPath: parentPath, parentNode: parentNode, paths: paths};
      console.log(paths);
      this.updateQueue.push(task, () => {
      });
    });
    this.electronService.ipcRenderer.on('thumb-update', (event, hash) => {
      this.thumbUpdate[hash] = true;
      this.cdr.detectChanges();
    });
    this.justStarted();
  }

  changeSubPath(event: string) {
    const firstItem = this.virtualScroller.viewPortItems[0];
    console.log(firstItem);
    this.selectedSubPath = event;
    this.cdr.detectChanges();
    this.virtualScroller.scrollInto(firstItem, true, 0, 0);
  }

  removeBySubpath(paths: DirTreeElement[], subPath: string): DirTreeElement[] {
    paths = paths.filter((element) => {
      return element.path !== subPath;
    });
    return paths;
  }

  insertUpdatedNode(parentPath: string, parentNode: DirTreeNode) {
    const dirs = parentPath.split('/');
    let currentNode = this.root.tree[0];
    if (dirs.length > 1) {
      for (let i = 0; i < dirs.length; i++) {
        const dir = dirs[i];
        for (let j = 0; j < currentNode.children.length; j++) {
          const child = currentNode.children[j];
          if (child.name === dir) {
            currentNode = child;
            break;
          }
        }
      }
    }
    if (!currentNode.children) {
      currentNode.children = [];
    }
    let exists = false;
    for (let i = 0; i < currentNode.children.length; i++) {
      const element = currentNode.children[i];
      if (element.name === parentNode.name) {
        exists = true;
        if (element.children) {
          for (let j = 0; j < element.children.length; j++) {
            const child = element.children[j];
            for (let k = 0; k < parentNode.children.length; k++) {
              const parentChild = parentNode.children[k];
              if (child.name === parentChild.name) {
                parentNode.children[k] = child;
              }
            }
          }
        }
        currentNode.children[i] = parentNode;
        break;
      }
    }
    if (!exists) {
      if (currentNode === this.root.tree[0]) {
        parentNode.name = 'root';
        this.root.tree[0] = parentNode;
      } else {
        currentNode.children.push(parentNode);
      }
    }
  }

  public justStarted() {
    this.electronService.ipcRenderer.send('just-started', 'lol');
  }

  public updateDir(path: string) {
    this.electronService.ipcRenderer.send('update-dir', path);
  }

  public openNewRoot() {
    this.electronService.ipcRenderer.send('new-root');
  }

  public toggleRecursive() {
    this.recursive = !this.recursive;
    this.electronService.ipcRenderer.send('update-recursive', this.recursive);
    this.updateDir(this.selectedSubPath);
  }

  // Listen for key presses
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.keyCode === KEY_CODE.RIGHT_ARROW) {
      if (this.currentImage) {
        this.currentImage = this.currentImage.next;
      }
    } else if (event.keyCode === KEY_CODE.LEFT_ARROW) {
      if (this.currentImage) {
        this.currentImage = this.currentImage.prev;
      }
    }
  }
}
