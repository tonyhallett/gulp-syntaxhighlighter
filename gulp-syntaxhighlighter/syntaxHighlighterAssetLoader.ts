import * as path from 'path'
import * as fs from 'fs'
import { ISyntaxHighlighterAssetLoader } from "./interfaces"
import { getFilesWithExtensionFromDir } from "./fileHelper"

export class SyntaxHighlighterAssetLoader implements ISyntaxHighlighterAssetLoader {
    private getShCore(minified: boolean) {
        const shCorePath = "./syntaxHighlighter/shCore" + this.getJsExtension(minified);
        return fs.readFileSync(path.resolve(__dirname, shCorePath), "utf8");
    }

    private getBrushFiles(minified: boolean) {
        return getFilesWithExtensionFromDir(path.resolve(__dirname, "syntaxHighlighter"), (f => {
            return f.indexOf("shBrush") !== -1 && f.endsWith(this.getJsExtension(minified));
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