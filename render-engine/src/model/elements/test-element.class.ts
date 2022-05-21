import { DreamObject } from '../dream-object.class';
import { MeshRenderer } from '../components/mesh-renderer';
import { Vector2D } from '../math/vector-2d.class';

export class TestElement extends DreamObject {
    position: Vector2D = new Vector2D({x: 50, y: 50});

    constructor(parent: DreamObject) {
        super(parent);
        this.addComponent(MeshRenderer);
        const mesh = this.getComponent(MeshRenderer);
        mesh.strokeColor = "#000";
        mesh.fillColor = "#00f";
        mesh.strokeThickness = 1;
    }
}