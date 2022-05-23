import { Rectangle } from "../meshs/rectangle.mesh";
import { Component } from "../component.class";
import { Vector } from "../math/vector.class";
import { DreamObject } from "../dream-object.class";
import { IMouseEvent } from "model/events/mouse-event.interface";

export class MoveableComponent extends Component {
    mesh? = Rectangle;
    isFloating: boolean = false;

    

    constructor(parent: DreamObject) {
        super(parent)
        this.scale = new Vector({x: 2, y: 0.5, z:1});
    }

    mouseUp? = (e: IMouseEvent) => {
        this.isFloating = false;
    };

    mouseDown? = (e: IMouseEvent) => {
        this.isFloating = true;
    };

    mouseMove? = (e: IMouseEvent) => {
        if(!this.isFloating) return;
        
        const offset = e.canvasInfo.getMousePositionalOffset();
        this.attachedElement.position = this.attachedElement.position.add(offset);
    };

    mouseEnter? = (e: IMouseEvent) => {
        console.log("fff");
        
    }
}