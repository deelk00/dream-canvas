import { IRenderElement, ModelState, Point } from '../../services/canvas-manager/canvas-manager.service';

export class DragSelectingOverlay implements IRenderElement {
  zIndex: number = 99999999;
  isSelectable: boolean = false;
  isSelected: boolean = false;
  dimensions: Point = {
    x: 0,
    y: 0
  };
  displayPosition?: Point
  position: Point = {
    x: 0,
    y: 0
  };
  modelState: ModelState = ModelState.dirty;
  render = (ctx: CanvasRenderingContext2D, offset: Point) => {
    ctx.fillStyle = "#3435DD33";
    ctx.strokeStyle = "##3435DD11";
    ctx.lineWidth = 3;

    const positionOnCanvas = this.displayPosition ? {
      x: this.displayPosition.x + (0 - offset.x),
      y: this.displayPosition.y + (0 - offset.y)
    } : {
      x: this.position.x + (0 - offset.x),
      y: this.position.y + (0 - offset.y)
    }

    ctx.rect(positionOnCanvas.x, positionOnCanvas.y, this.dimensions.x, this.dimensions.y);
    ctx.fill();

  };
  unrender = (ctx: CanvasRenderingContext2D, offset: Point) => {
    ctx.clearRect(this.position.x + offset.x, this.position.y - offset.y, this.dimensions.x, this.dimensions.y);
  };

  data: any;

}
