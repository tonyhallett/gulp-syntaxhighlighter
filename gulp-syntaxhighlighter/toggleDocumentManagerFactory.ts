import { IToggleDocumentManagerFactory, IToggleDocumentManager, IJsDomDocument, IMinifier } from './interfaces'
import { IToggleConfig} from './publicInterfaces'
import {ToggleDocumentManager} from './toggleDocumentManager'

export class ToggleDocumentManagerFactory implements IToggleDocumentManagerFactory {
    create(jsDomDocument: IJsDomDocument, minifier: IMinifier): IToggleDocumentManager {
        return new ToggleDocumentManager(jsDomDocument, minifier);
    }
}


