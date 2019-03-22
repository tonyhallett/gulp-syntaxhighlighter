import { JSDOM } from 'jsdom';
import { IJsDomDocument } from './interfaces'
export class JsDomDocument implements IJsDomDocument {
    private syntaxHighlighterScriptClassName = "__syntaxHighlighterScript";
    private dom: JSDOM;
    private document: Document;

    constructor(html: string) {
        this.dom = new JSDOM(html, { runScripts: "dangerously" });
        this.document = this.dom.window.document;
    }

    addSyntaxHighlighterScript(contents: string) {
        this.addScript(contents,(se)=>{
            se.className = this.syntaxHighlighterScriptClassName;
        })
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
            return this.document.head.innerHTML + this.getBodyWithoutSyntaxHighlighterScripts();
        } else {
            return this.getDocTypeString() + this.getHtmlWithoutSyntaxHighlighterScripts();
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

    private getHtmlWithoutSyntaxHighlighterScripts() {
        const htmlEl = this.document.documentElement;
        let html = htmlEl.outerHTML;
        return this.removeScripts(html);
    }
    private getBodyWithoutSyntaxHighlighterScripts() {
        const body = this.document.body;
        let html = body.outerHTML;
        return this.removeScripts(html);
    }
    private removeScripts(html:string):string{
        const removableScripts = this.document.getElementsByClassName(this.syntaxHighlighterScriptClassName);
        for (let i = 0; i < removableScripts.length; i++) {
            html = html.replace(removableScripts[i].outerHTML, "");
        }
        return html;
    }
}