///<reference path="../toggle/toggleDefns.d.ts"/>
import * as path from 'path'
import * as fs from 'fs'
import { IToggleDocumentManager, IJsDomDocument, IMinifier } from './interfaces'
import { IToggleConfig, IToggleConfigMessage, IClassNames } from './publicInterfaces'

export class ToggleDocumentManager implements IToggleDocumentManager {
    private toggleConfigWithDefaults!: ToggleConfig
    private toggleConfigMessageDefault: IToggleConfigMessage = {
        hideMessage: "",
        showMessage: "",
        message: "",
        prefix: "",
        prefixHide: "",
        prefixShow: "",
        useTitle: false,
        when: "Never",
        placement: "Right"
    }
    private classNamesDefault: IClassNames = {
        toggleContainer: "toggleContainer",
        toggleText: "toggleText",
        toggle: "toggle",
        hideToggle: "hideToggle",
        showToggle: "showToggle",
        isShowing: "isShowing"
    }
    private createToggleFn!: string;
    private css!:string;
    constructor(private readonly jsDomDocument: IJsDomDocument, private readonly minifier: IMinifier) { }
        

    public addToggle(toggleConfig: IToggleConfig) {
        this.addToggleDefaults(toggleConfig);
        this.addToggleJs();
        this.addToggleCss();
    }

    private addToggleDefaults(toggleConfig: IToggleConfig) {

        var toggleConfigMessage = Object.assign({}, this.toggleConfigMessageDefault, toggleConfig.message);
        var classNames = Object.assign({}, this.classNamesDefault, toggleConfig.classNames);

        this.css = toggleConfig.customCss ? toggleConfig.customCss : this.getDefaultToggleCss(classNames);
        this.createToggleFn = toggleConfig.createToggleFn ? toggleConfig.createToggleFn : this.defaultCreateToggleFn()


        this.toggleConfigWithDefaults = {
            classNames: classNames,
            message: toggleConfigMessage,
            toggleState: toggleConfig.toggleState
        };
        
    }

    //#region toggle js
    private addToggleJs() {
        this.jsDomDocument.addToggleScript(this.getToggleScript());
    }
    private wrapInIEF(createToggleFn:string,toggleScript:string,setupToggle:string){
        let ief = `
(function(){
    ${createToggleFn}
    ${toggleScript}
    ${setupToggle}
})()
`
        return ief;
    }
    private getJsonToggleConfigString(){
        return JSON.stringify(this.toggleConfigWithDefaults);
    }
    private getSetUpToggleFunctionCall(){
        return `setUpToggle(${this.getJsonToggleConfigString()});`
    }
    private getToggleScript(): string {
        const script=this.wrapInIEF(this.createToggleFn,this.readToggle(),this.getSetUpToggleFunctionCall());
        return this.minifier.minifyScript(script);
    }
    private readToggle() {
        return fs.readFileSync(path.join(__dirname, "toggle/toggle.js"), "utf8");
    }
    private defaultCreateToggleFn(): string {
        return `
        function createToggleElement(show){//much easier through path
            var xmlns="http://www.w3.org/2000/svg"

            var svg=document.createElementNS(xmlns,"svg");
            
            svg.setAttributeNS(null,"fill","none");
            svg.setAttributeNS(null,"stroke-linecap","round");
            svg.setAttributeNS(null,"stroke-linejoin","round");
            svg.setAttributeNS(null,"stroke-width","2");
            svg.setAttributeNS(null,"viewBox","0 0 24 24");
           
            var rect=document.createElementNS(xmlns,"rect");
            rect.setAttributeNS(null,"height",14);
            rect.setAttributeNS(null,"rx",7);
            rect.setAttributeNS(null,"ry",7);
            rect.setAttributeNS(null,"width",22);
            rect.setAttributeNS(null,"x",1);
            rect.setAttributeNS(null,"y",5);

            var circle=document.createElementNS(xmlns,"circle")
            circle.setAttributeNS(null,"cy",12);
            circle.setAttributeNS(null,"r",3);
            circle.setAttributeNS(null,"cx",show?16:8);

            svg.append(rect);
            svg.append(circle);
            
            return svg;
        }
        `
    }
    //#endregion

    //#region toggleCSS
    private getDefaultToggleCss(classNames: IClassNames): string {
        const svgSize = "1em";
        return `.${classNames.toggle}{ stroke:#000;top:0.125em;position:relative;height:${svgSize};width:${svgSize} }
        .${classNames.toggleText}{ font-size:${svgSize}}
        `
    }
    private addToggleCss() {
        this.jsDomDocument.addCss(this.minifier.minifyCss(this.css));
    }
    //#endregion

}