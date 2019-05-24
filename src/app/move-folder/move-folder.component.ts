import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import {NgbTypeahead} from '@ng-bootstrap/ng-bootstrap';
import {Observable, Subject, merge} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, map} from 'rxjs/operators';

export interface MoveFolderEvent {
  rootFolder: string;
  subFolder: string;
}

@Component({
  selector: 'app-move-folder',
  templateUrl: './move-folder.component.html',
  styleUrls: ['./move-folder.component.scss']
})
export class MoveFolderComponent implements OnInit {

  @Input() rootFolderHistory: string[];
  @Input() subFolderHistory: string[];
  @Output() moveFolderSelected = new EventEmitter<MoveFolderEvent>();

  rootFolder: any;
  subFolder: any;

  @ViewChild('rootFolderInput') rootFolderInput: NgbTypeahead;
  rootFocus$ = new Subject<string>();
  rootClick$ = new Subject<string>();

  @ViewChild('subFolderInput') subFolderInput: NgbTypeahead;
  subFocus$ = new Subject<string>();
  subClick$ = new Subject<string>();

  searchRootFolder = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
    const clicksWithClosedPopup$ = this.rootClick$.pipe(filter(() => !this.rootFolderInput.isPopupOpen()));
    const inputFocus$ = this.rootFocus$;

    return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
      map(term => (term === '' ? this.rootFolderHistory
        : this.rootFolderHistory.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1)).slice(0, 10))
    );
  }

  searchSubFolder = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
    const clicksWithClosedPopup$ = this.subClick$.pipe(filter(() => !this.subFolderInput.isPopupOpen()));
    const inputFocus$ = this.subFocus$;

    return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
      map(term => (term === '' ? this.subFolderHistory
        : this.subFolderHistory.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1)).slice(0, 10))
    );
  }

  constructor() { }

  ngOnInit() {
  }

  outputMoveFolder() {
    this.moveFolderSelected.emit({rootFolder: this.rootFolder || this.rootFolderHistory[0],
      subFolder: this.subFolder || this.subFolderHistory[0]});
  }
}
