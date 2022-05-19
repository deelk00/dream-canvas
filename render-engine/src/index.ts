import { v4 as uuid } from 'uuid';
import { Vector2D } from './model/math/vector-2d.class';
import { CustomAttribute } from './model/enums/custom-attribute.enum';
import { DreamElement } from './model/dream-element.class';
import { IComponent } from './model/component.interface';
import { IEvent } from 'model/events/event.interface';
import { IRenderEvent } from 'model/events/render-event.interface';


export interface IDreamCanvasOptions {
    autoResolution?: boolean;
}

export interface IDreamRenderingInformation {
    id: string;
    context: CanvasRenderingContext2D;
    offset: Vector2D;
    options: IDreamCanvasOptions;
    resizeObserver: ResizeObserver;
}

export class DreamCanvas {
    private _renderingContexts: { [id: string]: IDreamRenderingInformation } = {};
    private _lastTimeStamp: number = Date.now();
    private _isAlive: boolean = true;

    private _elements: { [id: string]: DreamElement } = {};

    get elements() {return Object.assign(this._elements)};

    private eventHandlers: { 
        event: keyof HTMLElementEventMap, 
        handlers: ((...args: any) => void)[] 
    }[] = [
        {
            event: "contextmenu",
            handlers: []
        }
    ]

    constructor() {
        this.render();
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
            offset: new Vector2D(),
            options,
            // indirect call to allow overriding the resize handler
            resizeObserver: new ResizeObserver((entries: ResizeObserverEntry[]) => this.resizeHandler(entries))
        }
        canvas.setAttribute(CustomAttribute.Id, info.id);
        info.resizeObserver.observe(canvas);

        this._renderingContexts[info.id] = info;

        for (const eventHandler of this.eventHandlers) {
            info.context.canvas.addEventListener(eventHandler.event, (ev: Event) => {
                for (const func of eventHandler.handlers) {
                    func(ev);
                }
            });
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

    public addElement = <T extends DreamElement>(t: (new () => T) | DreamElement): DreamElement => {
        let e: DreamElement;
        if(typeof(t) === "function") {
            e = new t();
        }else{
            e = t;
        }

        this._elements[e.id] = e;

        return e;
    }

    public getElement = (id: string): DreamElement => {
        return this._elements[id];
    }

    public removeElement = (id: string): DreamElement => {
        const e = this._elements[id];
        if(e){
            delete this._elements[id];
        }
        return e;
    }

    private _fireEvent = (eventName: keyof IComponent, args: IEvent, elements?: DreamElement[]) => { 
        elements ??= Object.values(this._elements);

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

        const elements = Object.values(this._elements);
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
                for (const component of Object.values(element.components).filter(c => c.vertices && (c.strokeColor || c.fillColor))) {
                    info.context.beginPath();
                    info.context.strokeStyle = component.strokeColor ?? "#00000000";
                    info.context.fillStyle = component.fillColor ?? "#00000000";
                    info.context.lineWidth = component.strokeThickness;

                    if(component.vertices && component.vertices.length > 1) {
                        const startPos = component.vertices![0];
                        info.context.moveTo(startPos.x, startPos.y)
                        for (const vertex of component.vertices!) {
                            info.context.lineTo(vertex.x, vertex.y);
                        }
                    }
                    
                    info.context.closePath();
                    if(component.strokeColor) info.context.stroke();
                    if(component.fillColor) info.context.fill();
                }
            }
        }

        this._fireEvent("afterRender", args, elements);

        requestAnimationFrame(this.render);
    }
}