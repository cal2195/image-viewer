import { Component, OnInit, ChangeDetectorRef, HostListener, ViewChild } from '@angular/core';
import { ElectronService } from '../../providers/electron.service';
import { DirTree, DirTreeElement, DirTreeNode } from '../../../../main-files';
import { removeBySubpath, insertUpdatedNode, deleteNodeAndPaths } from '../../../../main-shared';
import { FileTreeComponentComponent } from '../../file-tree-component/file-tree-component.component';
import { VirtualScrollerComponent } from 'ngx-virtual-scroller';
import { TagFreqService, TagFreq } from '../../tag-freq.service';
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
  virtualScroller: VirtualScrollerComponent;

  updateQueue = async.queue(async (task, callback) => {
    let newPaths = this.root.paths.slice(0);
    newPaths = removeBySubpath(newPaths, task.parentPath + '/' + task.parentNode.name);
    newPaths = newPaths.concat(task.paths);
    this.root.paths = newPaths;
    insertUpdatedNode(this.root, task.parentPath, task.parentNode);
    this.dirtyTree = true;
    callback();
  }, 1);

  saveAndExitQueue = async.queue(async (task, callback) => {
    this.electronService.ipcRenderer.send('save-root-file', this.root);
    callback();
  }, 1);

  root: DirTree = null;
  displayTreeRoot: DirTreeNode[];
  displayPaths: DirTreeElement[];
  dirtyTree = false;
  selectedSubPath: string;
  recursive = false;
  currentImage: DirTreeElement;
  thumbUpdate: boolean[] = [];

  searchString = '';
  saved = false;

  tagFreqArray: TagFreq[];

  constructor(
    public electronService: ElectronService,
    private cdr: ChangeDetectorRef,
    private tagFreqService: TagFreqService) {}

  resetTreeTimer() {
    setTimeout(() => {
      if (this.dirtyTree) {
        //const firstItem = this.virtualScroller.viewPortItems[0];
        this.dirtyTree = false;
        this.displayTreeRoot = this.root.tree;
        this.displayPaths = this.root.paths;
        this.treeview.tree.treeModel.update();
        console.log('updating screen');
        this.cdr.detectChanges();
        //this.virtualScroller.scrollInto(firstItem, true, 10, 0);
      }
      this.resetTreeTimer();
    }, 1000);
  }

  findCurrentParent() {
    if (this.currentImage) {
      console.log('trying to find %s', this.currentImage.path);
      const parentNode = this.treeview.tree.treeModel.getNodeById(this.currentImage.path);
      if (parentNode) {
        console.log('found parent node!');
        parentNode.setActiveAndVisible();
        this.currentImage = null;
      }
    }
  }

  ngOnInit() {
    window.onbeforeunload = (e) => {
      if (!this.saved) {
        console.log('I do not want to be closed');
        this.electronService.ipcRenderer.send('save-root-file');
        e.returnValue = false; // equivalent to `return false` but not recommended
      }
    };
    // this.updateQueue.drain = () => {
    //   this.treeview.tree.treeModel.update();
    //   console.log('updating screen');
    //   this.cdr.detectChanges();
    // }
    this.electronService.ipcRenderer.on('write-done', (event) => {
      this.saved = true;
      window.close();
    });
    this.electronService.ipcRenderer.on('root-init', (event, root) => {
      this.root = root;
      this.displayTreeRoot = this.root.tree;
      this.displayPaths = this.root.paths;
      this.resetTreeTimer();
      this.cdr.detectChanges();
    });
    this.electronService.ipcRenderer.on('node-update', (event, parentPath, parentNode, paths) => {
      const task = {parentPath: parentPath, parentNode: parentNode, paths: paths};
      //console.log(paths);
      this.updateQueue.push(task, () => {
      });
    });
    this.electronService.ipcRenderer.on('thumb-update', (event, hash) => {
      this.thumbUpdate[hash] = true;
      this.cdr.detectChanges();
    });
    this.tagFreqService.tagNotifier.subscribe((value: TagFreq[]) => {
      this.tagFreqArray = value;
      // this.cd.detectChanges();
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

  public markSelectedForDelete() {
    const sep = this.selectedSubPath.lastIndexOf('/');
    const subpath = this.selectedSubPath.substring(0, sep);
    const folder = this.selectedSubPath.substring(sep+1);
    this.electronService.ipcRenderer.send('mark-for-delete', subpath, folder);
    deleteNodeAndPaths(this.root, this.selectedSubPath);
    this.dirtyTree = true;
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
