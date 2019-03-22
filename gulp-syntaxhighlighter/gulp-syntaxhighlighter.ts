import { SyntaxHighlighterAssetLoader } from "./syntaxHighlighterAssetLoader"
import { SyntaxHighlighterTransform } from './syntaxHighlighterTransform'
import { Minifier } from "./minifier"
import { JsDomDocumentFactory } from './jsDomDocumentFactory'
import { SyntaxHighlighterDocumentManagerFactory } from './syntaxHighlighterDocumentManagerFactory'
import { ToggleDocumentManagerFactory } from './toggleDocumentManagerFactory'
import { GulpSyntaxHighlighterOptions } from './publicInterfaces'

export function syntaxHighlighter(options?: GulpSyntaxHighlighterOptions) {
    options=options?options:{};
    return new SyntaxHighlighterTransform(
        options,
        new SyntaxHighlighterAssetLoader(),
        new Minifier(),
        new JsDomDocumentFactory(),
        new SyntaxHighlighterDocumentManagerFactory(),
        new ToggleDocumentManagerFactory()
    );
}
