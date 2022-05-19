import { Component, HostListener, OnInit } from '@angular/core';
import { IconDefinition, SizeProp } from '@fortawesome/fontawesome-svg-core';
import { faArrowAltCircleUp, faArrowCircleUp, faArrowUp } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-property-editor',
  templateUrl: './property-editor.component.html',
  styleUrls: ['./property-editor.component.scss'],
  host: {
    '[class.extended]': 'extended'
  }
})
export class PropertyEditorComponent implements OnInit {

  extended: boolean = false;

  icons = {
    arrow: faArrowAltCircleUp
  }

  classes = {
    arrow: "arrow-left"
  }

  iconSize: SizeProp = "1x";

  constructor() { }

  ngOnInit(): void {
  }

  @HostListener('click', ['$event'])
  click() {
    this.classes.arrow = this.classes.arrow == "arrow-right" ? "arrow-left" : "arrow-right";
    this.extended = !this.extended;
  }
}
