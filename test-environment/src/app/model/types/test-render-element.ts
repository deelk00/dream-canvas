import { IRenderElement, ModelState, Point } from '../../services/canvas-manager/canvas-manager.service';

export class TestRenderElement implements IRenderElement {
  zIndex: number = 0;
  isSelectable: boolean = true;
  isSelected: boolean = false;
  dimensions: Point = {
    x: 50,
    y: 50
  };
  displayPosition: Point = {
    x: 0,
    y: 0
  }
  position: Point = {
    x: 0,
    y: 0
  };
  color?: string;
  modelState: ModelState = ModelState.dirty;
  render = (ctx: CanvasRenderingContext2D, offset: Point) => {
    ctx.fillStyle = this.color ?? "#000000";
    ctx.strokeStyle = "#55f";
    ctx.lineWidth = 5;

    const positionOnCanvas = {
      x: this.displayPosition.x + (0 - offset.x),
      y: this.displayPosition.y + (0 - offset.y)
    }

    if(this.isSelected) {
      ctx.rect(positionOnCanvas.x, positionOnCanvas.y, this.dimensions.x, this.dimensions.y);
      ctx.fill();
    }else{
      ctx.fillRect(positionOnCanvas.x, positionOnCanvas.y, this.dimensions.x, this.dimensions.y);
    }

  };
  unrender = (ctx: CanvasRenderingContext2D, offset: Point) => {
    ctx.clearRect(this.position.x + offset.x, this.position.y - offset.y, this.dimensions.x, this.dimensions.y);
  };

  data: any;

}
