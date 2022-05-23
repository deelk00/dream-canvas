import { Vector } from '../math/vector.class';
import { Component } from '../component.class';
import { DreamObject } from '../dream-object.class';
import { Mesh } from '../mesh.interface';
import { Rectangle } from '../meshs/rectangle.mesh';
import { DreamRenderingInformation } from '../index';
import { RenderType } from '../enums/render-type.enum';

export class MeshComponent extends Component {
    mesh = Rectangle;
    renderType: RenderType = RenderType.Mesh;

    strokeColor?: string;
    fillColor?: string;
    strokeThickness: number = 1;

    constructor(attachedElement: DreamObject) {
        super(attachedElement);
    }

    render = (info: DreamRenderingInformation, offset: Vector, scale: Vector) => {
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