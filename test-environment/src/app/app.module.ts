import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TabBarComponent } from './components/tab-bar/tab-bar.component';
import { RelationDiagramModule } from './components/relation-diagram/relation-diagram.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  declarations: [
    AppComponent,
    TabBarComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RelationDiagramModule,
    FontAwesomeModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
