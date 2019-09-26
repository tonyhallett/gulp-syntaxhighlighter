import { IToggleDocumentManagerFactory, IToggleDocumentManager, IJsDomDocument, IMinifier, IToggleLocator } from './interfaces'
import {ToggleDocumentManager} from './toggleDocumentManager'

export class ToggleDocumentManagerFactory implements IToggleDocumentManagerFactory {
    constructor(private toggleLocator:IToggleLocator){

    }
    create(jsDomDocument: IJsDomDocument, minifier: IMinifier): IToggleDocumentManager {
        return new ToggleDocumentManager(jsDomDocument, minifier,this.toggleLocator);
    }
}


