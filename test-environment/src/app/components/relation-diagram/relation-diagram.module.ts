import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RelationDiagramComponent } from './relation-diagram/relation-diagram.component';
import { PropertyEditorComponent } from './property-editor/property-editor.component';
import { ToolBarComponent } from './tool-bar/tool-bar.component';
import { WorkAreaComponent } from './work-area/work-area.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

const imAndExports: any[] = [
  FontAwesomeModule
]

@NgModule({
  declarations: [
    RelationDiagramComponent,
    ToolBarComponent,
    WorkAreaComponent,
    PropertyEditorComponent
  ],
  imports: [
    CommonModule,
    imAndExports
  ],
  exports: [
    RelationDiagramComponent,
    imAndExports
  ]
})
export class RelationDiagramModule { }
