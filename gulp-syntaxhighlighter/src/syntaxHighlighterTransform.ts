import { GulpTransformBase, File, TransformCallback } from "gulptransformbase"
import { IJsDomDocument, IMinifier, IJsDomDocumentFactory, ISyntaxHighlighterDocumentManagerFactory, ISyntaxHighlighterAssetLoader,IToggleDocumentManagerFactory } from './interfaces'
import { GulpSyntaxHighlighterOptions} from './publicInterfaces'



export class SyntaxHighlighterTransform extends GulpTransformBase<GulpSyntaxHighlighterOptions> {

    //region defaults
    private globalParams:GulpSyntaxHighlighterOptions["globalParams"]={}
    private config:GulpSyntaxHighlighterOptions["config"] = {}
    private themeName = "Default";
    private useMinifiedSyntaxHighlighter = true;
    
    private isPartial = function (html: string, file: File) {
        const firstTag = html.substring(html.indexOf("<"), html.indexOf(">")).toLowerCase();
        return !(firstTag.startsWith("<!doctype") || firstTag.startsWith("<html") || firstTag.startsWith("<head") || firstTag.startsWith("<body"));
    }
    //#endregion

    private html!: string;
    private file!: File;
    private jsDomDocument!: IJsDomDocument

    constructor(options: GulpSyntaxHighlighterOptions, private readonly assetLoader: ISyntaxHighlighterAssetLoader, private readonly minifier: IMinifier, private readonly jsDomDocumentFactory: IJsDomDocumentFactory, private readonly syntaxHighlighterDocumentManagerFactory: ISyntaxHighlighterDocumentManagerFactory, private readonly toggleDocumentManagerFactory: IToggleDocumentManagerFactory) {
        super(options);

        //override defaults from options if provided

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
        if(options.config){
            this.config=options.config;
        }
        this.initializeMinifier();

    }
    private initializeMinifier(){
        var minifiedOutput = true;
        if (this.options!.minifiedOutput !== undefined) {
            minifiedOutput = this.options!.minifiedOutput
        }
        this.minifier.initialize(minifiedOutput);
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
            var toggleDocumentManager = this.toggleDocumentManagerFactory.create(this.jsDomDocument, this.minifier);
            toggleDocumentManager.addToggle(this.options!.toggleConfig);
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
        const toolbarFalse:{toolbar:false}={toolbar:false};
        syntaxHighlighterDocumentManager.applySyntaxHighlighter(Object.assign({},this.globalParams,toolbarFalse), this.config);
    }

    private getNewContents() {
        return this.jsDomDocument.getNewContents(this.isPartial(this.html, this.file))
    }

}
