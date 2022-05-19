import { v4 as uuid } from 'uuid';
import { Component } from './component.class';
import { IComposable } from './composable.interface';
import { Dimensions2D } from './math/dimensions-2d.class';
import { Vector2D } from './math/vector-2d.class';

export abstract class DreamElement implements IComposable {
    private _id: string = uuid();
    get id() {return this._id;};

    position: Vector2D = new Vector2D();
    zIndex: number = 0;

    getDimensions = (): Dimensions2D => {
        let startX = 0;
        let startY = 0;
        let endX = 0;
        let endY = 0;

        for (const component of Object.values(this._components)) {
            const dims = component.getDimensions();

            startX = Math.min(dims.startVector.x, startX);
            startY = Math.min(dims.startVector.y, startY);
            endX = Math.max(dims.endVector.x, endX);
            endY = Math.max(dims.endVector.y, endY);
        }

        return {
            startVector: new Vector2D({x: startX, y: startY}),
            endVector: new Vector2D({x: endX, y: endY})
        };
    }

    private _components: { [id: string]: Component } = {};

    get components() { return Object.assign({}, this._components); };

    getComponent = <T extends Component>(t: new (a: DreamElement) => T) => this._components[t.name] as T;
    addComponent = <T extends Component>(t: new (a: DreamElement) => T) => {
        if(this._components[t.name]) {
            throw new Error("component already added");
        }

        this._components[t.name] = new t(this);
        return this._components[t.name] as T;
    }
    removeComponent = <T extends Component>(t: new (a: DreamElement) => T) => {
        const comp = this._components[t.name] as T;
        if(comp) {
            delete this._components[t.name];
        }
        return comp;
    };
}