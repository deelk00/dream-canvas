import { IComponent } from "./component.interface";
import { IContextMenuEvent } from "./events/context-menu-event.interface";
import { IKeyboardEvent } from "./events/keyboard-event.interface";
import { IMouseEvent } from "./events/mouse-event.interface";
import { IRenderEvent } from "./events/render-event.interface";
import { ILifeCycleEvent } from "./events/start-event.interface";
import { Dimensions2D } from "./math/dimensions-2d.class";
import { RenderType } from './enums/render-type.enum';
import { DreamObject } from "./dream-object.class";
import { IDreamRenderingInformation } from "../index";
import { Vector } from "./math/vector.class";
import { Mesh } from "./mesh.interface";

export abstract class Component implements IComponent {
    attachedElement: DreamObject;
    mesh?: Mesh;
    scale: Vector;
    renderType: RenderType = RenderType.Mesh;

    position: Vector = new Vector();

    strokeColor?: string;
    fillColor?: string;
    strokeThickness: number = 1;

    getDimensions = (): Dimensions2D => {
        if(this.renderType === RenderType.Circle){
            const v = this.mesh && this.mesh.length > 0 ? this.mesh[0] : { vertex: new Vector() };
            return {
                startVector: new Vector({x: v.vertex.x, y: v.vertex.y}),
                endVector: new Vector({x: v.vertex.x + this.scale.x, y: v.vertex.y + this.scale.y})
            }
        }

        if(!this.mesh) return {startVector: new Vector(), endVector: new Vector()}

        let startX = 0;
        let startY = 0;
        let endX = 0;
        let endY = 0;

        for (const v of this.mesh) {
            startX = Math.min(v.vertex.x * this.scale.x, startX);
            startY = Math.min(v.vertex.y * this.scale.y, startY);
            endX = Math.max(v.vertex.x * this.scale.x, endX);
            endY = Math.max(v.vertex.y * this.scale.y, endY);
        }

        return {
            startVector: new Vector({x: startX, y: startY}),
            endVector: new Vector({x: endX, y: endY})
        };
    }
    
    constructor(attachedElement: DreamObject) {
        this.attachedElement = attachedElement;
        this.scale = new Vector({x: 1, y: 1, z: 1});
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

    render = (info: IDreamRenderingInformation, offset: Vector, scale: Vector) => {
        const calcVertexPosition = (vertex: Vector): Vector => {  
            return new Vector ({
                x: (offset.x + info.offset.x + this.position.x) + ( vertex.x * this.scale.x * scale.x),
                y: (offset.y + info.offset.y + this.position.y) + ( vertex.y * this.scale.y * scale.y),
                z: (offset.z + info.offset.z + this.position.z) + ( vertex.z * this.scale.z * scale.z)
            });
        }

        info.context.beginPath();
        info.context.strokeStyle = this.strokeColor ?? "#00000000";
        info.context.fillStyle = this.fillColor ?? "#00000000";
        info.context.lineWidth = this.strokeThickness;
        
        if(this.mesh && this.mesh.length > 1) {
            let pos = calcVertexPosition(this.mesh![0].vertex);    
            info.context.moveTo(pos.x, pos.y);
            
            for (const v of this.mesh!) {
                pos = calcVertexPosition(v.vertex);
                
                if(v.arcTo) {
                    const arc = calcVertexPosition(v.arcTo);
                    info.context.arcTo(pos.x, pos.y, arc.x, arc.y, v.radius ?? 5);
                }else{
                    info.context.lineTo(pos.x, pos.y);
                }
            }
        }
        
        info.context.closePath();
        
        if(this.strokeColor) info.context.stroke();
        if(this.fillColor) info.context.fill();
    }
}