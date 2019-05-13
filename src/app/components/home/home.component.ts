import { Component, OnInit } from '@angular/core';
import { ElectronService } from '../../providers/electron.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(
    public electronService: ElectronService) {}

  ngOnInit() {
    this.justStarted();
  }

  public justStarted(): void {
    this.electronService.ipcRenderer.send('just-started', 'lol');
  }
}
