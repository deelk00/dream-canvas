import { Vector } from "../math/vector.class";
import { Mesh } from "../mesh.interface";

export const Rectangle: Mesh = [
    { vertex: new Vector({x: 0, y: 0}) },
    { vertex: new Vector({x: 1, y: 0}) },
    { vertex: new Vector({x: 1, y: 1}) },
    { vertex: new Vector({x: 0, y: 1}) }
]