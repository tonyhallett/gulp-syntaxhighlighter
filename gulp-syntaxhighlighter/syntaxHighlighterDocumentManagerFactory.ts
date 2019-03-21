import { ISyntaxHighlighterDocumentManagerFactory, ISyntaxHighlighterDocumentManager, IJsDomDocument, IMinifier, ISyntaxHighlighterAssetLoader } from './interfaces'
import { SyntaxHighlighterDocumentManager } from './syntaxHighlighterDocumentManager'
export class SyntaxHighlighterDocumentManagerFactory implements ISyntaxHighlighterDocumentManagerFactory {
    create(jsDomDocument: IJsDomDocument, minifier: IMinifier, assetLoader: ISyntaxHighlighterAssetLoader): ISyntaxHighlighterDocumentManager {
        return new SyntaxHighlighterDocumentManager(jsDomDocument, minifier, assetLoader);
    }
}


