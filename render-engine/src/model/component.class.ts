import { IComponent } from "./component.interface";
import { IContextMenuEvent } from "./events/context-menu-event.interface";
import { IKeyboardEvent } from "./events/keyboard-event.interface";
import { IMouseEvent } from "./events/mouse-event.interface";
import { IRenderEvent } from "./events/render-event.interface";
import { ILifeCycleEvent } from "./events/start-event.interface";
import { Dimensions2D } from "./math/dimensions-2d.class";
import { Vector2D } from "./math/vector-2d.class";
import { RenderType } from './enums/render-type.enum';
import { DreamElement } from "./dream-element.class";

export abstract class Component implements IComponent {
    attachedElement: DreamElement;
    vertices?: Vector2D[] = [];
    scale: Vector2D = new Vector2D({x: 1, y: 1});
    renderType: RenderType = RenderType.Mesh;

    strokeColor?: string;
    fillColor?: string;
    strokeThickness: number = 1;

    getDimensions = (): Dimensions2D => {

        if(this.renderType === RenderType.Circle){
            const vertex = this.vertices && this.vertices.length > 0 ? this.vertices[0] : new Vector2D();
            return {
                startVector: new Vector2D({x: vertex.x, y: vertex.y}),
                endVector: new Vector2D({x: vertex.x + this.scale.x, y: vertex.y + this.scale.y})
            }
        }

        if(!this.vertices) return {startVector: new Vector2D(), endVector: new Vector2D()}

        let startX = 0;
        let startY = 0;
        let endX = 0;
        let endY = 0;

        for (const vertex of this.vertices) {
            startX = Math.min(vertex.x, startX);
            startY = Math.min(vertex.y, startY);
            endX = Math.max(vertex.x, endX);
            endY = Math.max(vertex.y, endY);
        }

        return {
            startVector: new Vector2D({x: startX, y: startY}),
            endVector: new Vector2D({x: endX, y: endY})
        };
    }
    
    constructor(attachedElement: DreamElement) {
        this.attachedElement = attachedElement;
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