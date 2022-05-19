import { IEvent } from "./event.interface";

export interface ILifeCycleEvent extends IEvent {
    timeStamp: number;
}