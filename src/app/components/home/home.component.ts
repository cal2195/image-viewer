import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ElectronService } from '../../providers/electron.service';
import { DirTree } from '../../../../main-files';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  root: DirTree = null;
  selectedSubPath: string;

  constructor(
    public electronService: ElectronService,
    private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.electronService.ipcRenderer.on('root-update', (event, rootNode) => {
      this.root = rootNode;
      console.log(this.root);
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
}
