import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileTreeComponentComponent } from './file-tree-component.component';

describe('FileTreeComponentComponent', () => {
  let component: FileTreeComponentComponent;
  let fixture: ComponentFixture<FileTreeComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FileTreeComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileTreeComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
