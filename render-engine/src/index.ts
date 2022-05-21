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


export interface IDreamCanvasOptions {
    autoResolution?: boolean;
}

export interface IDreamRenderingInformation {
    id: string;
    context: CanvasRenderingContext2D;
    offset: Vector;
    options: IDreamCanvasOptions;
    resizeObserver: ResizeObserver;
    components: {[id: string]: RootComponent};
}

export class DreamCanvas {
    private _renderingContexts: { [id: string]: IDreamRenderingInformation } = {};
    private _lastTimeStamp: number = Date.now();
    private _isAlive: boolean = true;

    root: DreamObject = new RootObject();

    get objects() {return this.root.children};

    private mouseEvents: [keyof HTMLElementEventMap, keyof RootObject][];

    constructor() {
        this.render();
        this.mouseEvents = [
            ["mousedown", "mouseDown"],
            ["mouseup", "mouseUp"],
            ["mouseenter", "mouseEnter"],
            ["mousemove", "mouseMove"],
            ["contextmenu", "contextMenu"],
            ["mouseleave", "mouseLeave"]
        ]
    }

    getMouseEventArgs = (e: MouseEvent): IMouseEvent | undefined => {
        const canvasId = (e.target as HTMLCanvasElement).getAttribute(CustomAttribute.Id);
        if(!canvasId) return;
        const info = this.getCanvasInformation(canvasId);

        return {
            originalEvent: e,
            dreamCanvas: this,
            cancelled: false,
            mousePositions: {
                canvas: new Vector({x: e.offsetX, y: e.offsetY}),
                worksheet: new Vector({
                    x: e.offsetX + info.offset.x,
                    y: e.offsetY + info.offset.y
                })
            }
        };
    }

    mouseHandler = (e: MouseEvent, eventHandler: keyof RootObject) => {
        const args = this.getMouseEventArgs(e);
        if(!args) return;

        (this.root[eventHandler] as any)(args);
    }

    public destroy = () => {
        this._isAlive = false;
    }

    public addCanvas = (
        canvas: HTMLCanvasElement, 
        options: IDreamCanvasOptions = {
            autoResolution: true,
        }
    ): IDreamRenderingInformation => {
        const info: IDreamRenderingInformation = {
            id: uuid(),
            context: canvas.getContext("2d")!,
            offset: new Vector({x: 0, y: 0}),
            options,
            // indirect call to allow overriding the resize handler
            resizeObserver: new ResizeObserver((entries: ResizeObserverEntry[]) => this.resizeHandler(entries)),
            components: {}
        }
        canvas.setAttribute(CustomAttribute.Id, info.id);
        info.resizeObserver.observe(canvas);

        this._renderingContexts[info.id] = info;

        for (const event of this.mouseEvents) {
            info.context.canvas.addEventListener(event[0], (e: any) => this.mouseHandler(e, event[1]));
        }

        return info;
    }

    public removeCanvas = (id: string): IDreamRenderingInformation => {
        const info = this._renderingContexts[id];
        delete this._renderingContexts[id];
        info.resizeObserver.unobserve(info.context.canvas);
        return info;
    }

    public getCanvasInformation = (id: string): IDreamRenderingInformation => this._renderingContexts[id];

    public resizeHandler = (entries: ResizeObserverEntry[]): void => {
        for (const entry of entries) {
            const id = entry.target.getAttribute(CustomAttribute.Id);
            if(!id) continue;

            const info = this._renderingContexts[id];
            if(!info) continue;
            
            info.context.canvas.style.width = "100%";
            info.context.canvas.style.height = "100%";
    
            info.context.canvas.width = entry.contentRect.width;
            info.context.canvas.height = entry.contentRect.height;
        }
    }

    public addObject = <T extends DreamObject>(t: (new (parent: DreamObject) => T) | DreamObject): DreamObject => {
        return this.root.addChildren(t);
    }

    public getObject = (id: string): DreamObject => {
        return this.root.getChildren(id);
    }

    public removeObject = (id: string): DreamObject => {
        return this.root.removeChildren(id);
    }


    // TODO: recursivly go through every children of the element and fire the event
    private _fireEvent = (eventName: keyof IComponent, args: IEvent, elements?: DreamObject[]) => { 
        elements ??= Object.values(this.root.children);

        for (const element of elements) {
            args.cancelled = false;
            for (const component of Object.values(element.components).filter(c => c[eventName])) {
                component[eventName]!(args as any);
                if(args.cancelled)
                    break;
            }
        }
    }

    public render = () => {

        if(!this._isAlive)
            return;
        const now = Date.now();
        const delta = now - this._lastTimeStamp;
        this._lastTimeStamp = now;

        const elements = Object.values(this.root.children);
        
        const args: IRenderEvent = {
            delta,
            dreamCanvas: this,
            cancelled: false
        }
        this._fireEvent("beforeRender", args, elements);
        
        for (const info of Object.values(this._renderingContexts)) {
            const visibleElements = elements.filter(e => {
                const dims = e.getDimensions();
                
                return e.position.x + dims.startVector.x > info.offset.x;
            });

            for (const element of visibleElements) {
                element.render(info, new Vector(), new Vector({x: 1, y: 1, z: 1}));
            }
        }

        this._fireEvent("afterRender", args, elements);

        requestAnimationFrame(this.render);
    }
}