import { IEvent } from "./event.interface";
import { Key } from '../enums/key.enum';

export interface IKeyboardEvent extends IEvent {
    key: Key;
}