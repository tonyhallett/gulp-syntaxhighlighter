
import { IJsDomDocumentFactory } from './interfaces'
import { JsDomDocument} from './jsDomDocument'
export class JsDomDocumentFactory implements IJsDomDocumentFactory {
    create(html: string) {
        return new JsDomDocument(html);
    }
}



