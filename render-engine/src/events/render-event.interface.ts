import { IEvent } from "./event.interface";

export interface IRenderEvent extends IEvent {
    delta: number;
}