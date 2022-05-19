import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { CanvasColors } from '../../model/enums/canvas-colors';
import { DragSelectingOverlay } from '../../model/types/drag-selecting-overlay';

export interface Point {
  x: number;
  y: number;
}

export enum ModelState {
  clean,
  dirty,
  touched
}

export interface IGenericRenderElement<T> extends IRenderElement {
  data: T;
}

export interface IRenderElement {
  zIndex: number;
  modelState: ModelState;
  isSelected: boolean;
  isSelectable: boolean;
  position: Point;
  displayPosition?: Point;
  dimensions: Point;
  render: (ctx: CanvasRenderingContext2D, offset: Point) => void;
  unrender: (ctx: CanvasRenderingContext2D, lastOffset: Point) => void;
  data: any;
}

export enum RenderingState {
  Running,
  Stopped
}

const key = {
  Ctrl: "control",
  Shift: "shift",
  Enter: "enter",
  Escape: "escape",
  BackSpace: "backspace",
  CapsLock: "capslock",
  Tab: "tab",
  Zero: "0",
  One: "1",
  Two: "2",
  Three: "3",
  Four: "4",
  Five: "5",
  Six: "6",
  Seven: "7",
  Eight: "8",
  Nine: "9",
  Q: "q",
  W: "w",
  E: "e",
  R: "r",
  T: "t",
  Z: "z",
  U: "u",
  I: "i",
  O: "o",
  P: "p",
  A: "a",
  S: "s",
  D: "d",
  F: "f",
  G: "g",
  H: "h",
  J: "j",
  K: "k",
  L: "l",
  Y: "y",
  X: "x",
  C: "c",
  V: "v",
  B: "b",
  N: "n",
  M: "m",
  Comma: ",",
  Colon: ".",
  SemiColon: ";",
  DoubleColon: ":",
  Plus: "+",
  Minus: "-",
  Star: "*",
  Slash: "/",
  BackSlash: "\\",
  ArrowUp: "arrowup",
  ArrowLeft: "arrowleft",
  ArrowRight: "arrowright",
  ArrowDown: "arrowdown",
}

@Injectable({
  providedIn: 'root'
})
export class CanvasManagerService {
  $renderingState: BehaviorSubject<RenderingState> = new BehaviorSubject<RenderingState>(RenderingState.Running);
  get renderingState() { return this.$renderingState.getValue(); };

  private _frameId: number = 0;

  get frameId() { return this._frameId; };

  pressedKeys: string[] = [];

  dragMove: boolean = false;

  accumulatedOffset: Point = {
    x: 0,
    y: 0
  }

  lastFrameId: number = 0;

  fps: number = 45;

  isPressed = false;
  clipToGrid = !false;

  isDragSelecting = false;
  dragSelectingElement: IRenderElement = new DragSelectingOverlay();

  mousePosition: Point = {
    x: 0,
    y: 0
  };

  contexts: CanvasRenderingContext2D[] = [];

  renderingTask!: Promise<void>;
  renderingTaskSubscription?: Subscription;

  elements: IRenderElement[] = [];

  elementClickPosition?: Point;

  showGrid: boolean = true;
  visibleGridSize: Point = {
    x: 50,
    y: 50
  };
  positionalGridSize: Point = {
    x: 10,
    y: 10
  }

  mouseUpTimeout?: any;

  mouseDownTime: number = 0;
  acceptedClickTime: number = 100;

  private _canvasOffset: Point = {
    x: 0,
    y: 0
  }

  private _lastCanvasOffset: Point = {
    x: 0,
    y: 0
  }

  private _cachedOffset: Point = {
    x: 0,
    y: 0
  }

  get canvasOffset(): Point { return Object.assign({}, this._canvasOffset) }

  modelState: ModelState = ModelState.dirty;

  constructor() {
    this.renderingTask = this.renderFunction();
  }


  addElement = (element: IRenderElement) => {
    this.elements.push(element);
    this.elements = this.elements.sort((a,b) => b.zIndex - a.zIndex);
  }

  removeElement = (element: IRenderElement) => {
    this.elements = this.elements.filter(e => e != element);
  }

  getSelected = () => {
    return this.elements.filter(x => x.isSelected && x.isSelectable);
  }

  clearSelected = () => {
    this.elements.forEach(x => x.isSelected = false);
  }

  isKeyPressed = (s: string) => {
    return this.pressedKeys.some(x => x === s);
  }

  keyDownHandler = (e: KeyboardEvent) => {
    if(!this.pressedKeys.some(x => x == e.key.toLowerCase()))
      this.pressedKeys.push(e.key.toLowerCase());
  }

  keyUpHandler = (e: KeyboardEvent) => {
    this.pressedKeys = this.pressedKeys.filter(x => x != e.key.toLowerCase());
  }

  mouseDownHandler = (e: MouseEvent) => {
    this.mouseDownTime = Date.now();

    if(e.button == 0) {
      const positionOnWorksheet: Point = {
        x: this.canvasOffset.x + e.offsetX,
        y: this.canvasOffset.y + e.offsetY
      }

      const clickedElement = this.elements.find(element =>
        element.position.x < positionOnWorksheet.x
        && element.position.x + element.dimensions.x > positionOnWorksheet.x
        && element.position.y < positionOnWorksheet.y
        && element.position.y + element.dimensions.y > positionOnWorksheet.y
      );

      if(!clickedElement?.isSelected
        && !this.isKeyPressed(key.Ctrl)) {
        this.clearSelected();
      }

      if(clickedElement) {
        this.mousePosition = {
          x: e.offsetX,
          y: e.offsetY,
        }
        clickedElement.isSelected = true;

        this.elementClickPosition = {
          x: this.mousePosition.x + this.canvasOffset.x - clickedElement.position.x,
          y: this.mousePosition.y + this.canvasOffset.y - clickedElement.position.y
        }
      } else {
        this.isDragSelecting = true;
        this.dragSelectingElement.position = {
          x: e.offsetX + this.canvasOffset.x,
          y: e.offsetY + this.canvasOffset.y
        }
        this.dragSelectingElement.dimensions = {
          x: 0,
          y: 0
        }
        this.addElement(this.dragSelectingElement);
      }

    }

    if(e.button == 2) {
      this.activateDragMove(e);
    }else{
      this.mouseUpTimeout = setTimeout(() => {
        this.isPressed = true;
      }, this.acceptedClickTime);
    }

  }

  mouseUpHandler = (e: MouseEvent) => {
    if(this.mouseUpTimeout)
      clearTimeout(this.mouseUpTimeout);


    if(this.isDragSelecting) {
      this.removeElement(this.dragSelectingElement);

      const selectables = this.elements.filter(element =>
        element.position.x > this.dragSelectingElement.position.x
        && this.dragSelectingElement.position.x + this.dragSelectingElement.dimensions.x > element.position.x + element.dimensions.x
        && element.position.y > this.dragSelectingElement.position.y
        && this.dragSelectingElement.position.y + this.dragSelectingElement.dimensions.y > element.position.y + element.dimensions.y
        );


      selectables.forEach(x => {
        x.isSelected = true;
      })
    }

    this.mousePosition = {
      x: e.offsetX,
      y: e.offsetY
    };

    this.deactivateDragMove(e);
    this.isPressed = false;
  }

  mouseMoveHandler = (e: MouseEvent) => {
    const selected = this.getSelected();
    if(this.dragMove) {
      if(this.lastFrameId !== this.frameId){
        this.lastFrameId = this.frameId;
        this.accumulatedOffset = {
          x: 0,
          y: 0
        }
      }

      this.accumulatedOffset = {
        x: e.offsetX - this.mousePosition.x + this.accumulatedOffset.x,
        y: e.offsetY - this.mousePosition.y + this.accumulatedOffset.y
      }

      this.setOffset({
        x: this.canvasOffset.x - this.accumulatedOffset.x,
        y: this.canvasOffset.y - this.accumulatedOffset.y
      });

      this.mousePosition = {
        x: e.offsetX,
        y: e.offsetY
      }
    }

    if(this.isDragSelecting) {
      this.dragSelectingElement.dimensions = {
        x: e.offsetX + this.canvasOffset.x - this.dragSelectingElement.position.x,
        y: e.offsetY + this.canvasOffset.y - this.dragSelectingElement.position.y
      }
    }

    if(selected.length && this.isPressed && this.elementClickPosition) {
      selected.forEach((s) => {
        let position = {
          x: e.offsetX - this.mousePosition.x + s.position.x,
          y: e.offsetY - this.mousePosition.y + s.position.y
        };
        s.position = position;

        if(this.clipToGrid) {
          s.displayPosition = {
            x: position.x - position.x % this.positionalGridSize.x,
            y: position.y - position.y % this.positionalGridSize.y
          }
        }else{
          s.displayPosition = s.position;
        }
      });
    }

    this.mousePosition = {
      x: e.offsetX,
      y: e.offsetY
    }
  }

  mouseLeaveHandler = (e: MouseEvent) => {
    this.deactivateDragMove(e);
  }

  contextMenuHandler = (e: MouseEvent) => {
    if(e.button == 2) {
      e.preventDefault();
    }
  }

  clickHandler = (e: MouseEvent) => {

  }

  activateDragMove = (e: MouseEvent) => {
    this.dragMove = true;

    this.mousePosition = {
      x: e.offsetX,
      y: e.offsetY
    }
  }

  deactivateDragMove = (e: MouseEvent) => {
    this.dragMove = false;
  }

  addContext = (ctx: CanvasRenderingContext2D) => {
    this.contexts.push(ctx);
    ctx.canvas.addEventListener("click", this.clickHandler);
    ctx.canvas.addEventListener("mousedown", this.mouseDownHandler);
    ctx.canvas.addEventListener("mouseup", this.mouseUpHandler);
    ctx.canvas.addEventListener("mousemove", this.mouseMoveHandler);
    ctx.canvas.addEventListener("contextmenu", this.contextMenuHandler);
    ctx.canvas.addEventListener("mouseleave", this.mouseLeaveHandler);
    window.addEventListener("keyup", this.keyUpHandler);
    window.addEventListener("keydown", this.keyDownHandler);
  }

  removeContext = (ctx: CanvasRenderingContext2D) => {
    this.contexts = this.contexts.filter((c) => c != ctx);
    ctx.canvas.removeEventListener("click", this.clickHandler);
    ctx.canvas.removeEventListener("mousedown", this.mouseDownHandler);
    ctx.canvas.removeEventListener("mouseup", this.mouseUpHandler);
    ctx.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
    ctx.canvas.removeEventListener("contextmenu", this.contextMenuHandler);
    ctx.canvas.removeEventListener("mouseleave", this.mouseLeaveHandler);
    window.removeEventListener("keyup", this.keyUpHandler);
    window.removeEventListener("keydown", this.keyDownHandler);
  }

  setOffset = (offset: Point) => {
    this._cachedOffset = offset;
  }

  renderFunction = async (): Promise<void> => {
    const renderGrid = (ctx: CanvasRenderingContext2D) => {

      ctx.beginPath();

      ctx.strokeStyle = CanvasColors.Grid;
      ctx.lineWidth = 1;
      for (let x = 0; x < Math.ceil(ctx.canvas.width / this.visibleGridSize.x); x++) {
        const lineX = x * this.visibleGridSize.x - (this.canvasOffset.x % this.visibleGridSize.x);

        ctx.moveTo(lineX, 0);
        ctx.lineTo(lineX, ctx.canvas.height);
      }

      for (let y = 0; y < Math.ceil(ctx.canvas.height / this.visibleGridSize.y); y++) {
        const lineY = y * this.visibleGridSize.y - (this.canvasOffset.y % this.visibleGridSize.y);

        ctx.moveTo(0, lineY);
        ctx.lineTo(ctx.canvas.width, lineY);
      }

      ctx.stroke();
    }

    const render = async () => {
      const renderTasks = this.contexts.map(async ctx => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        renderGrid(ctx);

        const elements = this.elements.concat([]).sort((a,b) => a.zIndex - b.zIndex);

        for (const element of elements.filter(element =>
            element.position.x < this._canvasOffset.x + ctx.canvas.width
            && element.position.x + element.dimensions.x > this._canvasOffset.x
            && element.position.y < this._canvasOffset.y + ctx.canvas.height
            && element.position.y + element.dimensions.y > this._canvasOffset.y
            )) {
          ctx.beginPath();

          element.render(ctx, this._canvasOffset);

          ctx.stroke();
        }
      });

      await Promise.all(renderTasks);
    }

    this.renderingTaskSubscription?.unsubscribe();

    do {
      this._frameId = Math.round(Math.random() * 100000)

      this._lastCanvasOffset = this._canvasOffset;
      this._canvasOffset = this._cachedOffset;

      const delayTask = sleep(1000 / this.fps);
      const rendering = render();

      await Promise.all([delayTask, rendering]);

    } while (this.renderingState != RenderingState.Stopped)

    this.renderingTaskSubscription = this.$renderingState.subscribe((state) => {
      if(state == RenderingState.Running) {
        this.renderingTask = this.renderFunction();
      }
    });
  }

}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(() => resolve(ms), ms));
}
