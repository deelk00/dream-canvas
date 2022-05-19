import { Component } from '../component.class';
import { DreamElement } from '../dream-element.class';
import { Vector2D } from '../math/vector-2d.class';

export class MeshRenderer extends Component {
    vertices: Vector2D[] = [
        new Vector2D({x: 0, y: 0}),
        new Vector2D({x: 50, y: 0}),
        new Vector2D({x: 50, y: 50}),
        new Vector2D({x: 0, y: 50})
    ];

    constructor(attachedElement: DreamElement) {
        super(attachedElement);
    }
}