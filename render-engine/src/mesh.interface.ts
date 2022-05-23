import { Vector } from "./math/vector.class"

export type Mesh = {
    vertex: Vector,
    arcTo?: Vector,
    radius?: number
}[]