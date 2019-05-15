import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { ElectronService } from '../../providers/electron.service';
import { DirTree, DirTreeElement } from '../../../../main-files';

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

  root: DirTree = null;
  selectedSubPath: string;
  recursive = false;
  currentImage: DirTreeElement;
  thumbUpdate: boolean[] = [];

  constructor(
    public electronService: ElectronService,
    private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.electronService.ipcRenderer.on('root-update', (event, rootNode) => {
      this.root = rootNode;
      this.cdr.detectChanges();
    });
    this.electronService.ipcRenderer.on('thumb-update', (event, hash) => {
      this.thumbUpdate[hash] = true;
      this.cdr.detectChanges();
    });
    this.justStarted();
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
