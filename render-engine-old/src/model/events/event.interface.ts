import { DreamCanvas, DreamRenderingInformation } from '../../index';
export interface IEvent {
    dreamCanvas: DreamCanvas;
    originalEvent?: Event;
    cancelled?: boolean;
    canvasInfo: DreamRenderingInformation
}