import { Component } from "./component.class";

export interface IComposable {
    components: { [id: string]: Component };

    getComponent: <T extends Component>(t: new () => T) => T;
    addComponent: <T extends Component>(t: new () => T) => T;
    removeComponent: <T extends Component>(t: new () => T) => T;
}