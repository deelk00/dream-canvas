import { DreamObject } from '../dream-object.class';
import { MeshComponent } from '../components/mesh-component';
import { Vector } from '../math/vector.class';
import { MoveableComponent } from '../components/moveable-component';

export class TestObject extends DreamObject {
    position: Vector = new Vector({x: 50, y: 50});
    scale: Vector = new Vector({x: 50, y: 50});

    constructor(parent: DreamObject) {
        super(parent);
        this.addComponent(MeshComponent);
        this.addComponent(MoveableComponent);
        const mesh = this.getComponent(MeshComponent);
        const move = this.getComponent(MoveableComponent);
        mesh.strokeColor = "#000";
        mesh.fillColor = "#00f";
        mesh.strokeThickness = 1;
    }
}