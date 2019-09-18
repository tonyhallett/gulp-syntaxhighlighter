import { GulpSyntaxHighlighterOptions } from './publicInterfaces'
import { ISyntaxHighlighterDocumentManagerFactory, ISyntaxHighlighterDocumentManager, IJsDomDocument, IMinifier, ISyntaxHighlighterAssetLoader, SyntaxHighlighterGlobalParamsNoToolbar } from './interfaces'
export class SyntaxHighlighterDocumentManager implements ISyntaxHighlighterDocumentManager {
    constructor(private readonly jsDomDocument: IJsDomDocument, private readonly minifier: IMinifier, private readonly assetLoader: ISyntaxHighlighterAssetLoader) { }

    public addSyntaxHighlighterScripts(useMinifiedSyntaxHighlighter: boolean) {
        const scripts = this.assetLoader.getScripts(useMinifiedSyntaxHighlighter);
        scripts.forEach(s => this.jsDomDocument.addSyntaxHighlighterScript(s));
    }

    public addCustomTheme(customTheme: string) {
        this.addMinifiableTheme(customTheme);
    }

    public addAdditionalCss(additionalCss: string) {
        this.addMinifiableTheme(additionalCss);
    }

    public addNamedTheme(themeName: string) {
        this.addTheme(this.assetLoader.getTheme(this.minifier.minifies, themeName));
    }

    private addMinifiableTheme(theme: string) {
        this.addTheme(this.minifier.minifyCss(theme));
    }

    private addTheme(theme: string) {
        this.jsDomDocument.addCss(theme);
    }
    private getHighlightScript(globalParams:string,config:string){
        
return `
function merge(obj1, obj2)
{

    var result = {}, name;
    
    for (name in obj1)
        result[name] = obj1[name];

    for (name in obj2)
        result[name] = obj2[name];
    

    return result;
};
SyntaxHighlighter.config=merge(SyntaxHighlighter.config,${config})
SyntaxHighlighter.highlight(${globalParams});
`
    }
    applySyntaxHighlighter(globalParams: SyntaxHighlighterGlobalParamsNoToolbar, config: GulpSyntaxHighlighterOptions["config"]) {
        this.jsDomDocument.executeSyntaxHighlighter(
            this.getHighlightScript(
                JSON.stringify(globalParams),
                JSON.stringify(config)
            )
        );
    }
}