import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MoveFolderComponent } from './move-folder.component';

describe('MoveFolderComponent', () => {
  let component: MoveFolderComponent;
  let fixture: ComponentFixture<MoveFolderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MoveFolderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MoveFolderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
