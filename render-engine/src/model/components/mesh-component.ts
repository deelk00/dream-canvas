import { Vector } from '../math/vector.class';
import { Component } from '../component.class';
import { DreamObject } from '../dream-object.class';
import { Mesh } from '../mesh.interface';
import { Rectangle } from '../meshs/rectangle.mesh';

export class MeshComponent extends Component {
    mesh = Rectangle

    constructor(attachedElement: DreamObject) {
        super(attachedElement);
    }
}