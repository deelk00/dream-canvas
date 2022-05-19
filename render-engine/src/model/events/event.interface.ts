import { DreamCanvas, IDreamRenderingInformation } from '../../index';
export interface IEvent {
    dreamCanvas: DreamCanvas;
    originalEvent?: Event;
    cancelled: boolean;
}