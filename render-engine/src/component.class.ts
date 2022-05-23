import { IComponent } from "./component.interface";
import { IContextMenuEvent } from "./events/context-menu-event.interface";
import { IKeyboardEvent } from "./events/keyboard-event.interface";
import { IMouseEvent } from "./events/mouse-event.interface";
import { IRenderEvent } from "./events/render-event.interface";
import { ILifeCycleEvent } from "./events/start-event.interface";
import { Dimensions2D } from "./math/dimensions-2d.class";
import { RenderType } from './enums/render-type.enum';
import { DreamObject } from "./dream-object.class";
import { DreamRenderingInformation } from "./index";
import { Vector } from "./math/vector.class";
import { Mesh } from "./mesh.interface";

export abstract class Component implements IComponent {
    attachedElement: DreamObject;
    scale: Vector;
    position: Vector = new Vector();
    
    constructor(attachedElement: DreamObject) {
        this.attachedElement = attachedElement;
        this.scale = new Vector({x: 1, y: 1, z: 1});
    }
    
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

    render?: (info: DreamRenderingInformation, offset: Vector, scale: Vector) => boolean | void
}