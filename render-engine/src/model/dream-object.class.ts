import { IDreamRenderingInformation } from '../index';
import { v4 as uuid } from 'uuid';
import { Component } from './component.class';
import { IComposable } from './composable.interface';
import { Dimensions2D } from './math/dimensions-2d.class';
import { Vector2D } from './math/vector-2d.class';

export abstract class DreamObject implements IComposable<Component> {
    private _id: string = uuid();
    get id() {return this._id;};

    position: Vector2D = new Vector2D();
    zIndex: number = 0;

    private _children: {[id: string]: DreamObject} = {};
    get children() {return this._children;};

    constructor(
        public parent: DreamObject
    ) {

    }

    public addChildren = <T extends DreamObject>(t: (new () => T) | DreamObject): DreamObject => {
        let e: DreamObject;
        if(typeof(t) === "function") {
            e = new t();
        }else{
            e = t;
        }

        this._children[e.id] = e;

        return e;
    }

    public getChildren = (id: string): DreamObject => {
        return this._children[id];
    }

    public removeChildren = (id: string): DreamObject => {
        const e = this._children[id];
        if(e){
            delete this._children[id];
        }
        return e;
    }

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

    getComponent = <T extends Component>(t: new (a: DreamObject) => T) => this._components[t.name] as T;
    addComponent = <T extends Component>(t: new (a: DreamObject) => T) => {
        if(this._components[t.name]) {
            throw new Error("component already added");
        }

        this._components[t.name] = new t(this);
        return this._components[t.name] as T;
    }
    removeComponent = <T extends Component>(t: new (a: DreamObject) => T) => {
        const comp = this._components[t.name] as T;
        if(comp) {
            delete this._components[t.name];
        }
        return comp;
    };

    render = (info: IDreamRenderingInformation, offset: Vector2D) => {
        for (const component of Object.values(this.components).filter(c => c.vertices && (c.strokeColor || c.fillColor))) {
            component.render(info, offset);
        }
    }
}