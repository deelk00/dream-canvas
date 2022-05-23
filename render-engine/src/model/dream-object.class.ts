import { IComponent } from './component.interface';
import { IDreamRenderingInformation } from '../index';
import { v4 as uuid } from 'uuid';
import { Component } from './component.class';
import { IComposable } from './composable.interface';
import { Dimensions2D } from './math/dimensions-2d.class';
import { Vector } from './math/vector.class';
import { ILifeCycleEvent } from './events/start-event.interface';
import { IRenderEvent } from './events/render-event.interface';
import { IMouseEvent } from './events/mouse-event.interface';
import { IKeyboardEvent } from './events/keyboard-event.interface';
import { IContextMenuEvent } from './events/context-menu-event.interface';

export abstract class DreamObject implements IComponent, IComposable<Component> {
    private _id: string = uuid();
    get id() {return this._id;};

    position: Vector = new Vector();
    scale: Vector = new Vector({x: 1, y: 1, z: 1});
    zIndex: number = 0;

    private _children: {[id: string]: DreamObject} = {};
    get children() {return this._children;};

    constructor(
        public parent: DreamObject
    ) {

    }

    public addChildren = <T extends DreamObject>(t: (new (parent: DreamObject) => T) | DreamObject): DreamObject => {
        let e: DreamObject;
        if(typeof(t) === "function") {
            e = new t(this);
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

            startX = Math.min(dims.startVector.x * this.scale.x + component.position.x, startX);
            startY = Math.min(dims.startVector.y * this.scale.y + component.position.y, startY);
            endX = Math.max(dims.endVector.x * this.scale.x + component.position.x, endX);
            endY = Math.max(dims.endVector.y * this.scale.y + component.position.y, endY);
        }

        for (const obj of Object.values(this._children)) {
            const dims = obj.getDimensions();

            startX = Math.min(obj.position.x + dims.startVector.x * this.scale.x, startX);
            startY = Math.min(obj.position.y + dims.startVector.y * this.scale.y, startY);
            endX = Math.max(obj.position.x + dims.endVector.x * this.scale.x, endX);
            endY = Math.max(obj.position.y + dims.endVector.y * this.scale.y, endY);
        }

        return {
            startVector: new Vector([startX, startY]),
            endVector: new Vector([endX, endY])
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

    render = (info: IDreamRenderingInformation, offset: Vector, scale: Vector) => {
        offset = offset.add(this.position);        
        scale = scale.multiply(this.scale);
        
        for (const component of Object.values(this.components).filter(c => c.mesh && (c.strokeColor || c.fillColor))) {
            component.render(info, offset,scale);
            
        }
        
        for (const obj of Object.values(this.children)) {
            obj.render(info, offset, scale);
        }
    }
    
    start?: (e: ILifeCycleEvent) => void;

    afterRender?: (e: IRenderEvent) => void;
    beforeRender?: (e: IRenderEvent) => void;
    
    mouseDown = (e: IMouseEvent) => {
        const elementDims = this.getDimensions();
        const worksheetPos = e.mousePositions.worksheet;
        console.log(elementDims);
        console.log(this.position.x);
        
        if(this.position.x + elementDims.startVector.x < worksheetPos.x
        ) {
            console.log("awd");
            
        } 
    };
    mouseUp? = (e: IMouseEvent) => {

    };

    keyDown?: (e: IKeyboardEvent) => void;
    keyUp?: (e: IKeyboardEvent) => void;

    mouseMove? = (e: IMouseEvent) => {

    };
    mouseLeave? = (e: IMouseEvent) => {

    };
    mouseEnter? = (e: IMouseEvent) => {

    };

    contextMenu? = (e: IContextMenuEvent) => {

    };
    end? = (e: ILifeCycleEvent) => {

    };
}