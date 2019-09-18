import { JSDOM } from 'jsdom';
import { IJsDomDocument } from './interfaces'
export class JsDomDocument implements IJsDomDocument {
    private dom: JSDOM;
    private document: Document;

    constructor(html: string) {
        this.dom = new JSDOM(html, { runScripts: "outside-only" });
        this.document = this.dom.window.document;
    }
    private scripts:string[]=[];
    addSyntaxHighlighterScript(contents: string) {
        this.scripts.push(contents);
    }
    executeSyntaxHighlighter(windowEval:string){
        this.scripts.push(windowEval);
        const toEval=this.scripts.join("");
        this.dom.window.eval(toEval);
    }
    addScript(contents:string,callback:(scriptEl:HTMLScriptElement)=>void=function(){}){
        const scriptEl = this.document.createElement("script");
        scriptEl.textContent = contents;
        callback(scriptEl);
        this.document.body.appendChild(scriptEl);
    }

    addToggleScript(contents: string) {
        this.addScript(contents);
    }

    addCss(css: string) {
        const style = this.document!.createElement("style");
        style.innerHTML = css;
        this.document.head.appendChild(style);
    }

    getNewContents(isPartial: boolean) {
        if (isPartial) {
            return this.document.head.innerHTML + this.document.body.outerHTML;
        } else {
            return this.getDocTypeString() + this.document.documentElement.outerHTML;
        }
    }

    private getDocTypeString() {
        var node = this.document.doctype;
        let html = "";
        if (node) {
            html = "<!DOCTYPE "
                + node.name
                + (node.publicId ? ' PUBLIC "' + node.publicId + '"' : '')
                + (!node.publicId && node.systemId ? ' SYSTEM' : '')
                + (node.systemId ? ' "' + node.systemId + '"' : '')
                + '>';
        }
        return html;
    }
}