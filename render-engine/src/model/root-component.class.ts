import { IComponent } from "./component.interface";
import { DreamCanvas } from '../index';
import { IContextMenuEvent } from "./events/context-menu-event.interface";
import { IKeyboardEvent } from "./events/keyboard-event.interface";
import { IMouseEvent } from "./events/mouse-event.interface";
import { IRenderEvent } from "./events/render-event.interface";
import { ILifeCycleEvent } from "./events/start-event.interface";
import { v4 as uuid } from "uuid";

export abstract class RootComponent implements IComponent {
    private _id = uuid();
    get id () {return this._id;};
    dreamCanvas: DreamCanvas;

    constructor(dreamCanvas: DreamCanvas) {
        this.dreamCanvas = dreamCanvas;
    }

    start?: (e: ILifeCycleEvent) => void;

    afterRender?: (e: IRenderEvent) => void;
    beforeRender?: (e: IRenderEvent) => void;
    
    mouseDown?: (e: IMouseEvent) => void;
    mouseUp?: (e: IMouseEvent) => void;

    keyDown?: (e: IKeyboardEvent) => void;
    keyUp?: (e: IKeyboardEvent) => void;

    mouseMove?: (e: IMouseEvent) => void;
    mouseLeave?: (e: IMouseEvent) => void;
    mouseEnter?: (e: IMouseEvent) => void;

    contextMenu?: (e: IContextMenuEvent) => void;
    end?: (e: ILifeCycleEvent) => void;
}