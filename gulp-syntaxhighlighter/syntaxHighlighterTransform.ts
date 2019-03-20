import { GulpTransformBase, File, GulpTransformBaseOptions, TransformCallback } from "gulptransformbase"
import { IJsDomDocument, IMinifier, IJsDomDocumentFactory, ISyntaxHighlighterDocumentManagerFactory, ISyntaxHighlighterAssetLoader,IToggleDocumentManagerFactory } from './interfaces'
import { SyntaxHighlighterOptions, SyntaxHighlighterTransformOptions} from './publicInterfaces'
export class SyntaxHighlighterTransform extends GulpTransformBase<SyntaxHighlighterTransformOptions> {

    //region defaults
    private globalParams = {};
    private themeName = "Default";
    private useMinifiedSyntaxHighlighter = true;
    private minifiedOutput = true;
    private isPartial = function (html: string, file: File) {
        const firstTag = html.substring(html.indexOf("<"), html.indexOf(">")).toLowerCase();
        return !(firstTag.startsWith("<!doctype") || firstTag.startsWith("<html") || firstTag.startsWith("<head") || firstTag.startsWith("<body"));
    }
    //#endregion

    private html!: string;
    private file!: File;
    private jsDomDocument!: IJsDomDocument

    constructor(options: SyntaxHighlighterOptions, private readonly assetLoader: ISyntaxHighlighterAssetLoader, private readonly minifier: IMinifier, private readonly jsDomDocumentFactory: IJsDomDocumentFactory, private readonly syntaxHighlighterDocumentManagerFactory: ISyntaxHighlighterDocumentManagerFactory, private readonly toggleDocumentManagerFactory: IToggleDocumentManagerFactory) {
        super(options,
            {
                supportsBuffer: true,
                supportsStream: false,
                pluginName: "gulp-syntaxhighlighter"
            }
        );
        //override defaults from options if provided
        if (options!.minifiedOutput !== undefined) {
            this.minifiedOutput = options!.minifiedOutput
        }
        this.minifier.initialize(this.minifiedOutput);

        if (options.useMinifiedSyntaxHighlighter !== undefined) {
            this.useMinifiedSyntaxHighlighter = options.useMinifiedSyntaxHighlighter;
        }
        if (options.isPartialFn) {
            this.isPartial = options.isPartialFn;
        }
        if (options.globalParams) {
            this.globalParams = options.globalParams;
        }
        if (options.theme) {
            this.themeName = options.theme;
        }
        if (options.useMinifiedSyntaxHighlighter) {
            this.useMinifiedSyntaxHighlighter = options.useMinifiedSyntaxHighlighter;
        }

    }


    protected transformBufferFile(file: File, contents: Buffer, encoding: string, cb: TransformCallback): void {
        this.file = file;
        this.html = contents.toString("utf8");
        this.jsDomDocument = this.jsDomDocumentFactory.create(this.html);

        this.setUpToggle();
        this.setUpSyntaxHighlighter();

        file.contents = new Buffer(this.getNewContents());
        cb(null, file);

    }

    private setUpToggle() {
        if (this.options!.toggleConfig) {
            var toggleDocumentManager = this.toggleDocumentManagerFactory.create(this.jsDomDocument, this.minifier, this.options!.toggleConfig);
            toggleDocumentManager.addToggle();
        }
    }

    private setUpSyntaxHighlighter() {
        var syntaxHighlighterDocumentManager = this.syntaxHighlighterDocumentManagerFactory.create(this.jsDomDocument, this.minifier, this.assetLoader);
        syntaxHighlighterDocumentManager.addSyntaxHighlighterScripts(this.useMinifiedSyntaxHighlighter)
        if (this.options!.customTheme) {
            syntaxHighlighterDocumentManager.addCustomTheme(this.options!.customTheme);
        } else {
            syntaxHighlighterDocumentManager.addNamedTheme(this.themeName);
        }
        if (this.options!.additionalCss) {
            syntaxHighlighterDocumentManager.addAdditionalCss(this.options!.additionalCss);
        }
        syntaxHighlighterDocumentManager.applySyntaxHighlighter(this.globalParams, this.options!.config);
    }

    private getNewContents() {
        return this.jsDomDocument.getNewContents(this.isPartial(this.html, this.file))
    }

}
