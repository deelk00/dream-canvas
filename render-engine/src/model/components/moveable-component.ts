import { Rectangle } from "../meshs/rectangle.mesh";
import { Component } from "../component.class";
import { Vector } from "../math/vector.class";
import { DreamObject } from "../dream-object.class";
import { IMouseEvent } from "model/events/mouse-event.interface";

export class MoveableComponent extends Component {
    mesh? = Rectangle;

    constructor(parent: DreamObject) {
        super(parent)
        this.scale = new Vector({x: 2, y: 0.5, z:1});
    }

    mouseDown?: (e: IMouseEvent) => {

    };
}