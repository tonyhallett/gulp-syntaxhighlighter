import { SyntaxHighlighterAssetLoader } from "./syntaxHighlighterAssetLoader"
import { SyntaxHighlighterTransform } from './syntaxHighlighterTransform'
import { Minifier } from "./minifier"
import { JsDomDocumentFactory } from './jsDomDocumentFactory'
import { SyntaxHighlighterDocumentManagerFactory } from './syntaxHighlighterDocumentManagerFactory'
import { ToggleDocumentManagerFactory } from './toggleDocumentManagerFactory'
import { SyntaxHighlighterOptions } from './publicInterfaces'

export function syntaxHighlighter(options?: SyntaxHighlighterOptions) {
    const transformOptions = Object.assign(
        options,
        {
            supportsBuffer: true,
            supportsStream: false,
            pluginName: "gulp-syntaxhighlighter"
        });

    return new SyntaxHighlighterTransform(
        transformOptions,
        new SyntaxHighlighterAssetLoader(),
        new Minifier(),
        new JsDomDocumentFactory(),
        new SyntaxHighlighterDocumentManagerFactory(),
        new ToggleDocumentManagerFactory()
    );
}
