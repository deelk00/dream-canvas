import { IComponent } from "./component.interface";
import { DreamCanvas } from '../index';

export abstract class RootComponent implements IComponent {
    dreamCanvas: DreamCanvas;

    constructor(dreamCanvas: DreamCanvas) {
        this.dreamCanvas = dreamCanvas;
    }

    start?: () => void;
    end?: () => void;
    
    update?: () => void;
    
    mouseDown?: () => void;
    mouseUp?: () => void;

    keyDown?: () => void;
    keyUp?: () => void;

    mouseMove?: () => void;
    mouseLeave?: () => void;
    mouseEnter?: () => void;

    contextMenu?: () => void;
}