import { IEvent } from "./event.interface";
import { Vector } from "../math/vector.class";

export interface IMouseEvent extends IEvent {
    mousePositions: {
        canvas: Vector,
        worksheet: Vector
    }
}