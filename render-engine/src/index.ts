import { IMouseEvent } from './model/events/mouse-event.interface';
import { v4 as uuid } from 'uuid';
import { CustomAttribute } from './model/enums/custom-attribute.enum';
import { DreamObject } from './model/dream-object.class';
import { IComponent } from './model/component.interface';
import { IEvent } from './model/events/event.interface';
import { IRenderEvent } from './model/events/render-event.interface';
import { IComposable } from './model/composable.interface';
import { RootComponent } from './model/root-component.class';
import { RootObject } from './model/dream-objects/root-object.class';
import { Vector } from './model/math/vector.class';
import { RelativePosition } from './model/enums/relative-position.enum';
import { SuppressContextMenuRootComponent } from './model/root-components/suppress-context-menu-component';
import { Component } from './model/component.class';


export interface IDreamCanvasOptions {
    autoResolution?: boolean;
}

export class DreamRenderingInformation implements IComposable<RootComponent> {
    id: string = uuid();
    offset: Vector = new Vector();
    options: IDreamCanvasOptions = {
        autoResolution: true
    };
    resizeObserver: ResizeObserver = new ResizeObserver((entries: ResizeObserverEntry[]) => this.resizeHandler(entries));
    components: {[id: string]: RootComponent} = {};
    context: CanvasRenderingContext2D;

    private _mousePositions: Vector[] = [];
    get mousePositions() {return [...this._mousePositions]};

    mousePositionsLength: number = 10;

    getMousePositionalOffset(): Vector {
        if(this._mousePositions.length < 2) return new Vector();
        return this._mousePositions[0].subtract(this._mousePositions[1]);
    }

    addMousePosition(v: Vector) {
        if(this._mousePositions.unshift(v) > this.mousePositionsLength) {
            this._mousePositions.splice(this.mousePositionsLength);
        }
    }

    public resizeHandler = (entries: ResizeObserverEntry[]): void => {
        for (const entry of entries) {
            const id = entry.target.getAttribute(CustomAttribute.Id);
            if(!id) continue;

            const info = this.dreamCanvas.renderingContexts[id];
            if(!info) continue;
            
            info.context.canvas.style.width = "100%";
            info.context.canvas.style.height = "100%";
    
            info.context.canvas.width = entry.contentRect.width;
            info.context.canvas.height = entry.contentRect.height;
        }
    }

    constructor(public canvas: HTMLCanvasElement, public dreamCanvas: DreamCanvas) {
        this.context = canvas.getContext("2d")!;
    }
    getComponent = <TS extends RootComponent>(t: new (dreamCanvas: DreamCanvas) => TS): TS => {
        return this.components[t.name] as TS;
    };
    addComponent = <TS extends RootComponent>(t: new (dreamCanvas: DreamCanvas) => TS) => {
        let e: TS;
        if(typeof(t) === "function") {
            e = new t(this.dreamCanvas);
        }else{
            e = t;
        }

        this.components[e.id] = e;

        return e;
    };
    removeComponent = <TS extends RootComponent>(t: new (dreamCanvas: DreamCanvas) => TS) => {
        const e = this.components[t.name];
        if(e){
            delete this.components[t.name];
        }
        return e as TS;
    };
}

export class DreamCanvas {
    renderingContexts: { [id: string]: DreamRenderingInformation } = {};
    private _lastTimeStamp: number = Date.now();
    private _isAlive: boolean = true;

    root: DreamObject = new RootObject();

    get objects() {return this.root.children};

    private mouseEvents: [keyof HTMLElementEventMap, keyof IComponent][];

    constructor() {
        this.render();
        this.mouseEvents = [
            ["mousedown", "mouseDown"],
            ["mouseup", "mouseUp"],
            ["contextmenu", "contextMenu"],
        ]
    }

    getMouseEventArgs = (e: MouseEvent): IMouseEvent | undefined => {
        const canvasId = (e.target as HTMLCanvasElement).getAttribute(CustomAttribute.Id);
        if(!canvasId) return;
        const info = this.getCanvasInformation(canvasId);

        return {
            originalEvent: e,
            dreamCanvas: this,
            currentMousePositions: {
                canvas: new Vector({x: e.offsetX, y: e.offsetY}),
                worksheet: new Vector({
                    x: e.offsetX + info.offset.x,
                    y: e.offsetY + info.offset.y
                })
            },
            canvasInfo: info
        };
    }

    mouseMoveHandler = (e: MouseEvent) => {
        const args = this.getMouseEventArgs(e);
        if(!args) return;

        args.canvasInfo.addMousePosition(args.currentMousePositions.worksheet);
        this.root.mouseMoveEventChain(args);
    }

    mouseHandler = (e: MouseEvent, eventHandler: keyof IComponent) => {
        const args = this.getMouseEventArgs(e);
        if(!args) return;

        this.root.mousePositionalEventChain(eventHandler, args);
    }

    public destroy = () => {
        this._isAlive = false;
    }

    public addCanvas = (
        canvas: HTMLCanvasElement, 
        options: IDreamCanvasOptions = {
            autoResolution: true,
        }
    ): DreamRenderingInformation => {
        const info: DreamRenderingInformation = new DreamRenderingInformation(canvas, this);
        info.options = options;

        canvas.setAttribute(CustomAttribute.Id, info.id);
        info.resizeObserver.observe(canvas);

        this.renderingContexts[info.id] = info;

        for (const event of this.mouseEvents) {
            info.context.canvas.addEventListener(event[0], (e: any) => this.mouseHandler(e, event[1]));
        }
        info.context.canvas.addEventListener("mousemove", this.mouseMoveHandler);

        return info;
    }

    public removeCanvas = (id: string): DreamRenderingInformation => {
        const info = this.renderingContexts[id];
        delete this.renderingContexts[id];
        info.resizeObserver.unobserve(info.context.canvas);
        return info;
    }

    public getCanvasInformation = (id: string): DreamRenderingInformation => this.renderingContexts[id];


    public addObject = <T extends DreamObject>(t: (new (parent: DreamObject) => T) | DreamObject): DreamObject => {
        return this.root.addChildren(t);
    }

    public getObject = (id: string): DreamObject => {
        return this.root.getChildren(id);
    }

    public removeObject = (id: string): DreamObject => {
        return this.root.removeChildren(id);
    }

    public render = () => {
        if(!this._isAlive)
            return;

        const now = Date.now();
        const delta = now - this._lastTimeStamp;
        this._lastTimeStamp = now;

        const elements = Object.values(this.root.children);
        
        for (const info of Object.values(this.renderingContexts)) {
            const args: IRenderEvent = {
                delta,
                dreamCanvas: this,
                canvasInfo: info
            };
    
            this.root.eventChain!("beforeRender", args);

            const visibleElements = elements.filter(e => {
                const dims = e.getDimensions();
                const startPos = e.position.add(dims.startVector);
                const endPos = e.position.add(dims.endVector);
                const canvasEndPos = info.offset.add(new Vector({x: info.context.canvas.width, y: info.context.canvas.height, z: 0 }));
                
                return info.offset.is(RelativePosition.AboveAndLeftFrom, startPos)
                    && canvasEndPos.is(RelativePosition.BelowAndRightFrom, endPos);
            });

            info.context.clearRect(0,0,info.canvas.width, info.canvas.height);

            for (const element of visibleElements) {
                element.render(info, new Vector(), new Vector({x: 1, y: 1, z: 1}));
            }

            this.root.eventChain!("afterRender", args);
        }


        requestAnimationFrame(this.render);
    }

    public static createDefault(canvas: HTMLCanvasElement) {
        const dreamCanvas = new DreamCanvas();
        const info = dreamCanvas.addCanvas(canvas);

        info.addComponent(SuppressContextMenuRootComponent);
    }
}