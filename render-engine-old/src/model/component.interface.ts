import { IContextMenuEvent } from "./events/context-menu-event.interface";
import { IKeyboardEvent } from "./events/keyboard-event.interface";
import { IMouseEvent } from "./events/mouse-event.interface";
import { IRenderEvent } from "./events/render-event.interface";
import { ILifeCycleEvent } from "./events/start-event.interface";

export interface IComponent {
    start?: (e: ILifeCycleEvent) => boolean | void;

    afterRender?: (e: IRenderEvent) => boolean | void;
    beforeRender?: (e: IRenderEvent) => boolean | void;
    
    mouseDown?: (e: IMouseEvent) => boolean | void;
    mouseUp?: (e: IMouseEvent) => boolean | void;

    keyDown?: (e: IKeyboardEvent) => boolean | void;
    keyUp?: (e: IKeyboardEvent) => boolean | void;

    mouseMove?: (e: IMouseEvent) => boolean | void;
    mouseLeave?: (e: IMouseEvent) => boolean | void;
    mouseEnter?: (e: IMouseEvent) => boolean | void;

    contextMenu?: (e: IContextMenuEvent) => boolean | void;
    end?: (e: ILifeCycleEvent) => boolean | void;
}