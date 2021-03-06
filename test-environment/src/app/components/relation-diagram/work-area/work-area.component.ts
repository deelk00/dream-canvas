import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { DreamCanvas } from "../../../../../../render-engine/t_dist";
import { TestObject } from "../../../../../../render-engine/t_dist/model/dream-objects/test-object.class";


@Component({
  selector: 'app-work-area',
  templateUrl: './work-area.component.html',
  styleUrls: ['./work-area.component.scss']
})
export class WorkAreaComponent implements OnInit, AfterViewInit {
  resolution = {
    x: 1,
    y: 1
  }

  canvasResizeObserver!: ResizeObserver;
  dreamCanvas!: DreamCanvas

  @ViewChild("canvas") canvas!: ElementRef<HTMLCanvasElement>

  constructor() {

  }

  ngAfterViewInit(): void {
    this.dreamCanvas = new DreamCanvas();
    this.dreamCanvas.addCanvas(this.canvas.nativeElement);

    this.dreamCanvas.addObject(TestObject);
  }

  ngOnInit(): void {
  }
}
