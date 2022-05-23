import { IContextMenuEvent } from '../events/context-menu-event.interface';
import { RootComponent } from '../root-component.class';

export class SuppressContextMenuRootComponent extends RootComponent {

    contextMenu? = (e: IContextMenuEvent) => {
        if(!e.originalEvent) return;

        e.originalEvent.preventDefault();
        console.log("e");
        
    };
}