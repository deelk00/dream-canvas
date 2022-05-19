import { round } from './round.func';
import { Vector } from './vector.class';
export class Vector2D extends Vector<Vector2D> {
    get x() { return this.getDimValue(0); };
    set x(value: number) { this.setDimValue(0, value) };

    get y() { return this.getDimValue(1); };
    set y(value: number) { this.setDimValue(1, value) };

    constructor(values?: {x: number, y: number} | number[]) {
        super(Array.isArray(values) ? values : [values ? values.x : 0, values ? values.y : 0]);
    }
}