import * as path from 'path'
import * as fs from 'fs'
import { ISyntaxHighlighterAssetLoader } from "./interfaces"
import { getFilteredFilesFromDirectoryDeep } from "./fileHelper"

export class SyntaxHighlighterAssetLoader implements ISyntaxHighlighterAssetLoader {
    private getShCore(minified: boolean) {
        const shCorePath = "./syntaxHighlighter/shCore" + this.getJsExtension(minified);
        return fs.readFileSync(path.resolve(__dirname, shCorePath), "utf8");
    }

    private getBrushFiles(minified: boolean) {
        return getFilteredFilesFromDirectoryDeep(path.resolve(__dirname, "syntaxHighlighter"), (f => {
            if(f.startsWith("shBrush")){
                if(minified){
                    return f.endsWith(".min.js");
                }else{
                    return f.endsWith(".js")&&!f.endsWith(".min.js");
                }
            }
            return false;
        }));
    }

    private getJsExtension(minified: boolean) {
        return minified ? ".min.js" : ".js";
    }

    getScripts(minified: boolean): string[] {
        return [this.getShCore(minified)].concat(this.getBrushFiles(minified).map(f => fs.readFileSync(f, "utf8")));
    }

    getTheme(minified: boolean, theme: string): string {
        const themePrefix = path.resolve(__dirname, "./syntaxHighlighter/shCore");
        const themePath = themePrefix + theme + (minified ? ".min" : "") + ".css";
        return fs.readFileSync(themePath, "utf8");
    }

}