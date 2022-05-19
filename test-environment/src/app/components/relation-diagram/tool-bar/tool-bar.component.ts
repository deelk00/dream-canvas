import { Component, HostListener, OnInit } from '@angular/core';
import { SizeProp } from '@fortawesome/fontawesome-svg-core';
import { faArrowAltCircleUp } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-tool-bar',
  templateUrl: './tool-bar.component.html',
  styleUrls: ['./tool-bar.component.scss'],
  host: {
    '[class.extended]': 'extended',
    '[class.reduced]': 'extended === false'
  }
})
export class ToolBarComponent implements OnInit {

  extended?: boolean;

  icons = {
    arrow: faArrowAltCircleUp
  }

  classes = {
    arrow: "arrow-right"
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
