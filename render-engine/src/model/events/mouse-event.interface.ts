import { IEvent } from "./event.interface";
import { Vector2D } from '../math/vector-2d.class';

export interface IMouseEvent extends IEvent {
    mousePositions: {
        canvas: Vector2D,
        worksheet: Vector2D
    }
}