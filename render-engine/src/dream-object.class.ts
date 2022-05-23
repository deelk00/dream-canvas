import { IComponent } from './component.interface';
import { DreamRenderingInformation } from './index';
import { v4 as uuid } from 'uuid';
import { Component } from './component.class';
import { IComposable } from './composable.interface';
import { Dimensions2D } from './math/dimensions-2d.class';
import { Vector } from './math/vector.class';
import { IMouseEvent } from './events/mouse-event.interface';
import { RelativePosition } from './enums/relative-position.enum';
import { IEvent } from './events/event.interface';

export abstract class DreamObject implements IComposable<Component> {
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

    public getWorksheetPosition = (): Vector => {
        return this.parent ? this.position.add(this.parent.getWorksheetPosition()) : this.position;
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

    getVisibleRectangle = (): Dimensions2D => {
        let startX = 0;
        let startY = 0;
        let endX = 0;
        let endY = 0;

        for (const component of Object.values(this._components)) {
            startX = Math.min(component.position.x, startX);
            startY = Math.min(component.position.y, startY);
            endX = Math.max(component.position.x + component.scale.x * this.scale.x, endX);
            endY = Math.max(component.position.y + component.scale.y * this.scale.y, endY);
        }

        for (const obj of Object.values(this._children)) {
            const dims = obj.getVisibleRectangle();

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

    render = (info: DreamRenderingInformation, offset: Vector, scale: Vector) => {
        offset = offset.add(this.position);        
        scale = scale.multiply(this.scale);
        
        for (const component of Object.values(this.components).filter(c => c.render)) {
            component.render!(info, offset,scale);
        }
        
        for (const obj of Object.values(this.children)) {
            obj.render(info, offset, scale);
        }
    }

    public eventChain(event: keyof IComponent, args: IEvent) {
        if(!args.cancelled) return;

        this.fireEventOnComponents(event, args);

        for (const child of Object.values(this._children)) {
            child.eventChain(event, args);
            if(args.cancelled) break;
        }
    }

    public mouseMoveEventChain = (e: IMouseEvent) => {
        const elementDims = this.getVisibleRectangle();
        const objWorksheetPos = this.getWorksheetPosition();
        if(e.canvasInfo.mousePositions.length < 2) return;

        this.fireEventOnComponents("mouseMove", e);
        if(!e.cancelled) {
            e.cancelled = undefined;
            for (const child of Object.values(this._children)) {
                child.mouseMoveEventChain(e);
                if(e.cancelled) break;
            }
        }
        
        if(e.currentMousePositions.worksheet.is(RelativePosition.BelowAndRightFrom, objWorksheetPos.add(elementDims.startVector))
            && e.currentMousePositions.worksheet.is(RelativePosition.AboveAndLeftFrom, objWorksheetPos.add(elementDims.endVector))
        ) {
            if(!e.canvasInfo.mousePositions[1].is(RelativePosition.BelowAndRightFrom, objWorksheetPos.add(elementDims.startVector))
                || !e.canvasInfo.mousePositions[1].is(RelativePosition.AboveAndLeftFrom, objWorksheetPos.add(elementDims.endVector))
            ) {
                this.fireEventOnComponents("mouseEnter", e);
            }


        }else {
            if(e.canvasInfo.mousePositions[1].is(RelativePosition.BelowAndRightFrom, objWorksheetPos.add(elementDims.startVector))
                && e.canvasInfo.mousePositions[1].is(RelativePosition.AboveAndLeftFrom, objWorksheetPos.add(elementDims.endVector))
            ) {
                this.fireEventOnComponents("mouseLeave", e);
            }
        }
    }

    public mousePositionalEventChain = (event: keyof IComponent, e: IMouseEvent) => {
        const elementDims = this.getVisibleRectangle();
        const objWorksheetPos = this.getWorksheetPosition();

        if(e.currentMousePositions.worksheet.is(RelativePosition.BelowAndRightFrom, objWorksheetPos.add(elementDims.startVector))
            && e.currentMousePositions.worksheet.is(RelativePosition.AboveAndLeftFrom, objWorksheetPos.add(elementDims.endVector))
        ) {
            this.fireEventOnComponents(event, e);
            if(!e.cancelled) {
                e.cancelled = undefined;
                for (const child of Object.values(this._children)) {
                    child.mousePositionalEventChain(event, e);
                    if(e.cancelled) break;
                }
            }
        } 
    }

    private fireEventOnComponents = (event: keyof IComponent, e: IEvent) => {
        for (const component of Object.values(this._components).filter(c => c[event])) {
            if((component[event] as any)!(e)) {
                break;
            }
        }
    }
}