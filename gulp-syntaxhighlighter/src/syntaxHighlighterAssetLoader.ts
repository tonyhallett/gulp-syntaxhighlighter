import * as path from 'path'
import * as fs from 'fs'
import { ISyntaxHighlighterAssetLoader, ISyntaxHighlighterAssetLocator } from "./interfaces"
import { getFilteredFilesFromDirectoryDeep } from "./fileHelper"

export class SyntaxHighlighterAssetLoader implements ISyntaxHighlighterAssetLoader {
    private assetFolder:string;
    constructor(syntaxHighlighterAssetLocator:ISyntaxHighlighterAssetLocator){
        this.assetFolder = syntaxHighlighterAssetLocator.getFolderPath();
    }
    private getShCore(minified: boolean) {
        const shCorePath = "shCore" + this.getJsExtension(minified);
        return fs.readFileSync(path.resolve(this.assetFolder, shCorePath), "utf8");
    }

    private getBrushFiles(minified: boolean) {
        return getFilteredFilesFromDirectoryDeep(this.assetFolder, (f,fn) => {
            if(fn.startsWith("shBrush")){
                if(minified){
                    return fn.endsWith(".min.js");
                }else{
                    return fn.endsWith(".js")&&!fn.endsWith(".min.js");
                }
            }
            return false;
        });
    }

    private getJsExtension(minified: boolean) {
        return minified ? ".min.js" : ".js";
    }

    getScripts(minified: boolean): string[] {
        return [this.getShCore(minified)].concat(this.getBrushFiles(minified).map(f => fs.readFileSync(f, "utf8")));
    }

    getTheme(minified: boolean, theme: string): string {
        const themeFileName = "shCore" + theme + (minified ? ".min" : "") + ".css";
        const themePath = path.resolve(this.assetFolder,themeFileName);
        return fs.readFileSync(themePath, "utf8");
    }

}