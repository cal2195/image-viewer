import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-image-view',
  templateUrl: './image-view.component.html',
  styleUrls: ['./image-view.component.scss']
})
export class ImageViewComponent implements OnInit {

  _currentImage;
  @Input() root;

  @Input()
  set currentImage(image) {
    this._currentImage = image;
    this.computeFilePath();
  }
  get currentImage() {
    return this._currentImage;
  }

  filePath: string;

  constructor() { }

  computeFilePath() {
    this.filePath = 'file://' + encodeURI(this.root.rootPath + this.currentImage.path + '/' + this.currentImage.name).replace(/#/g, '%23');
  }

  ngOnInit() {
    this.filePath = 'file://' + encodeURI(this.root.rootPath + this.currentImage.path + '/' + this.currentImage.name).replace(/#/g, '%23');
  }

}
