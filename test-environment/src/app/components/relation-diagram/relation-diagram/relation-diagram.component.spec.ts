import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelationDiagramComponent } from './relation-diagram.component';

describe('RelationDiagramComponent', () => {
  let component: RelationDiagramComponent;
  let fixture: ComponentFixture<RelationDiagramComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RelationDiagramComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RelationDiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
