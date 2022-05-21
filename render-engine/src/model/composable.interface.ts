import { Component } from "./component.class";
import { IComponent } from "./component.interface";

export interface IComposable<T extends IComponent> {
    components: { [id: string]: T };

    getComponent: <TS extends T>(t: new () => TS) => TS
    addComponent: <TS extends T>(t: new () => TS) => TS;
    removeComponent: <TS extends T>(t: new () => TS) => TS;
}