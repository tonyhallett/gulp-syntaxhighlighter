import { JSDOM } from 'jsdom';
import { IJsDomDocumentFactory, IJsDomDocument } from './interfaces'

export class JsDomDocumentFactory implements IJsDomDocumentFactory {
    create(html: string): IJsDomDocument {
        return new JsDomDocument(html);
    }
}

export class JsDomDocument implements IJsDomDocument {
    private removableScriptClassName = "__removableScript";
    private html: string;
    private dom: JSDOM;
    private document: Document;

    constructor(html: string) {
        this.html = html;
        this.dom = new JSDOM(html, { runScripts: "dangerously" });
        this.document = this.dom.window.document;
    }

    addRemovableScriptElement(contents: string) {
        const scriptEl = this.document.createElement("script");
        scriptEl.textContent = contents;
        scriptEl.className = this.removableScriptClassName;
        this.document.body.appendChild(scriptEl);
    }

    addScriptElement(contents: string) {
        const scriptEl = this.document.createElement("script");
        scriptEl.textContent = contents;
        this.document.body.appendChild(scriptEl);
    }

    addCss(css: string) {
        const style = this.document!.createElement("style");
        style.innerHTML = css;
        this.document.head.appendChild(style);
    }

    getNewContents(isPartial: boolean) {
        if (isPartial) {
            return this.document.head.innerHTML + this.getBodyWithoutInjectedScripts(false);
        } else {
            return this.getDocTypeString() + this.getHtmlWithoutInjectedScripts();
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

    private getHtmlWithoutInjectedScripts() {
        const htmlEl = this.document.documentElement;
        let html = htmlEl.outerHTML;
        const removableScripts = this.document.getElementsByClassName(this.removableScriptClassName);
        for (let i = 0; i < removableScripts.length; i++) {
            html = html.replace(removableScripts[i].outerHTML, "");
        }
        return html;
    }
    private getBodyWithoutInjectedScripts(outerHTML: boolean) {
        const body = this.document.body;
        let html = outerHTML ? body.outerHTML : body.innerHTML;
        const removableScripts = this.document.getElementsByClassName(this.removableScriptClassName);
        for (let i = 0; i < removableScripts.length; i++) {
            html = html.replace(removableScripts[i].outerHTML, "");
        }
        return html;
    }
}

