
import {JSDOM} from 'jsdom';
import {processString} from 'uglifycss'
import {minify} from 'uglify-js'
import * as fs from 'fs'
import * as path from 'path'

import { GulpTransformBase,File,GulpTransformBaseOptions,TransformCallback,PluginError } from "gulptransformbase"

export function syntaxHighlighter(options?:SyntaxHighlighterOptions){
    const transformOptions=Object.assign(options,{supportsBuffer:true,supportsStream:false,pluginName:"gulp-syntaxhighlighter"});
    var sht = new SyntaxHighlighterTransform(transformOptions);
    sht._setDependencies(new SyntaxHighlighterAssetLoader());
    return sht;
}

export interface ToggleConfigMessage{
    when?:"Always"|"Hidden"|"Never",
    prefix?:string,
    prefixShow?:string,
    prefixHide?:string,
    useTitle?:boolean,
    hideMessage?:string,
    showMessage?:string,
    message?:string,
    placement?:"Right"|"Below"
}
export interface ClassNames{
    toggleContainer?:string,
    toggleText?:string,
    toggle?:string,
    showToggle?:string,
    hideToggle?:string,
    isShowing?:string
}
export interface ToggleConfig{
    toggleState?:"Show"|"Hide",
    message?:ToggleConfigMessage,
    createToggleFn?:string,
    classNames?:ClassNames,
    customCss?:string
}export interface SyntaxHighlighterOptions{
    isPartialFn?:(html:string,file:File)=>boolean
    useMinifiedSyntaxHighlighter?:boolean
    minifiedOutput?:boolean
    theme?:string,
    customTheme?:string,
    additionalCss?:string,
    globalParams?:{
        /** Additional CSS class names to be added to highlighter elements. */
        /** default '' */
        "class-name"?:string,
        /** First line number. */
        /** Default 1 */
        "first-line"?:number
        /**
		 * Pads line numbers. Possible values are:
		 *
		 *   false - don't pad line numbers. ( default )
		 *   true  - automaticaly pad numbers with minimum required number of leading zeroes.
		 *   [int] - length up to which pad line numbers.
		 */
        'pad-line-numbers' ?: boolean,

        /** Lines to highlight. */
        //** default null */
		'highlight' ?: number[],

        /** Title to be displayed above the code block. */
        //** Default null */
		'title' ?: string,

        /** Enables or disables smart tabs. */
        /** default true */
		'smart-tabs' : boolean,

        /** Gets or sets tab size. */
        /** Default 4 */
		'tab-size' : number,

        /** Enables or disables gutter. */
        /** default true */
		'gutter' : boolean,

        /** Enables or disables toolbar. */
        /** Default true */
		//'toolbar' : boolean,

        /** Enables quick code copy and paste from double click. */
        /** default true */
		//'quick-code' : boolean,

        /** Forces code view to be collapsed. */
        //** default false */
		//'collapse' : boolean,

        /** Enables or disables automatic links. */
        /** default true */
		'auto-links' : boolean,

        /** Gets or sets light mode. Equavalent to turning off gutter and toolbar. */
        /** default false */
		//'light' : boolean,

        /** default true */
		'unindent' : boolean,

        //** default false */
		'html-script' : false
    }
    config?: {
        //** default &nbsp; */
		space ?: string,

        /** Enables use of <SCRIPT type="syntaxhighlighter" /> tags. */
        /** default true */
		useScriptTags? : boolean,

        /** Blogger mode flag. */
        /** default false */
		bloggerMode? : boolean,

        //default false
		stripBrs? : boolean,

        /** Name of the tag that SyntaxHighlighter will automatically look for. */
        /** default pre */
		tagName? : string,

		//strings? : {
            /** default 'expand source' */
            //expandSource : string,
            /** default ? */
            //help : string,
            /** dwfault 'SyntaxHighlighter\n\n */
            //alert: string,
            //default 'Can\'t find brush for: '
			//noBrush : string,
			//brushNotHtmlScript : 'Brush wasn\'t configured for html-script option: ',

			// this is populated by the build script
			//aboutDialog : string
		//}
    }
    //if not present then no toggle js/css
    toggleConfig?:ToggleConfig
}
export interface SyntaxHighlighterTransformOptions extends GulpTransformBaseOptions, SyntaxHighlighterOptions{ }

function getFilesWithExtensionFromDir(startPath:string,filter:(path:string)=>boolean,paths:string[]=[]){
    if (!fs.existsSync(startPath)){
        console.log("no dir ",startPath);
        return paths;
    }
    
    var files=fs.readdirSync(startPath);
    for(var i=0;i<files.length;i++){
        var filename=path.join(startPath,files[i]);
        var stat = fs.lstatSync(filename);
        if (stat.isDirectory()){
            getFilesWithExtensionFromDir(filename,filter,paths);
        }
        else if (filter(filename)) {
            paths.push(filename);
        };
    };
    return paths;
};

interface ISyntaxHighlighterAssetLoader {
    getScripts(minified: boolean): string[];
    getTheme(minified: boolean,theme:string): string;
}
class SyntaxHighlighterAssetLoader implements ISyntaxHighlighterAssetLoader{
    getScripts(minified: boolean): string[] {
        return [this.getShCore(minified)].concat(this.getBrushFiles(minified).map(f => fs.readFileSync(f, "utf8")));
    }
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
    getTheme(minified: boolean,theme:string):string {
        const themePrefix = path.resolve(__dirname, "./syntaxHighlighter/shCore");
        
        const themePath = themePrefix + theme + (minified ? ".min" : "") + ".css";
        return fs.readFileSync(themePath, "utf8");
    }

}

export class SyntaxHighlighterTransform extends GulpTransformBase<SyntaxHighlighterTransformOptions> {
    private removableScriptClassName = "__removableScript";

    private globalParams={};
    private useMinifiedSyntaxHighlighter=true;
    private minifiedOutput = true;

    private file:File|undefined;
    private document:Document|undefined;
    private dom:JSDOM|undefined;
    private html:string=""

    private _assetLoader!: ISyntaxHighlighterAssetLoader;

    constructor(options:SyntaxHighlighterOptions){
        super(options);
        //override defaults from options if provided
        if(this.options.minifiedOutput!==undefined){
            this.minifiedOutput=this.options.minifiedOutput
        }
        if(this.options.useMinifiedSyntaxHighlighter!==undefined){
            this.useMinifiedSyntaxHighlighter=this.options.useMinifiedSyntaxHighlighter;
        }
        if(this.options.isPartialFn){
            this.isPartial=this.options.isPartialFn;
        }
        if(this.options.globalParams){
            this.globalParams=this.options.globalParams;
        }
    }
    public _setDependencies(assetLoader: ISyntaxHighlighterAssetLoader): void {
        this._assetLoader = assetLoader;
    }
    private applySyntaxHighlighter(){
        (this.globalParams as any).toolbar=false;
        const highlightScript=`
        function merge(obj1, obj2)
        {
            
            var result = {}, name;
            
            for (name in obj1)
                result[name] = obj1[name];

            for (name in obj2)
                result[name] = obj2[name];
            

            return result;
        };
        
        SyntaxHighlighter.config=merge(SyntaxHighlighter.config,${JSON.stringify(this.options.config)})
       
        SyntaxHighlighter.highlight(${JSON.stringify(this.globalParams)});
        `
        this.addRemovableScriptElement(highlightScript);
        this.addCss();
    }
    
    //#region loading scripts into jsdom
    private addRemovableScriptElement(contents:string){
        const scriptEl=this.document!.createElement("script");
        scriptEl.textContent = contents;
        scriptEl.className=this.removableScriptClassName;
        this.document!.body.appendChild(scriptEl);
    }
    
    private loadSyntaxHighlighterScripts() {
        const scripts = this._assetLoader.getScripts(this.useMinifiedSyntaxHighlighter);
        scripts.forEach(s=>this.addRemovableScriptElement(s));
    }
    //#endregion
    private setUpDocument(html:string){
        this.html=html;
        this.dom=new JSDOM(html,{ runScripts: "dangerously" });
        this.document=this.dom.window.document;
        this.loadSyntaxHighlighterScripts();
    }
    protected transformBufferFile(file: File, contents: Buffer, encoding: string, cb: TransformCallback): void {
        this.file=file;
        
        this.setUpDocument(contents.toString("utf8"));
        this.addToggle();
        this.applySyntaxHighlighter();
        
        file.contents=new Buffer(this.getNewContents());
        cb(null,file);
        
    }
    //#region toggle
    //#region defaults
    private addToggleDefaults():ToggleConfig{
        var toggleConfig:ToggleConfig=this.options.toggleConfig!;
        toggleConfig.createToggleFn=toggleConfig.createToggleFn?toggleConfig.createToggleFn:this.defaultCreateToggleFn()
        
        this.addDefaultsToMessageConfig(toggleConfig);
        this.addDefaultClassNames(toggleConfig);
        return toggleConfig;
    }
    private addDefaultsToMessageConfig(toggleConfig:ToggleConfig){

        const defaults:ToggleConfigMessage={
            hideMessage:"",
            showMessage:"",
            message:"",
            prefix:"",
            prefixHide:"",
            prefixShow:"",
            useTitle:false,
            when:"Never",
            placement:"Right"
        }
        if(!toggleConfig.message){
            toggleConfig.message=defaults;
        }else{
            const newMessage=Object.assign({},defaults,toggleConfig.message);
            toggleConfig.message=newMessage
        }
    }
    private addDefaultClassNames(toggleConfig:ToggleConfig){
        const defaults:ClassNames={
            toggleContainer:"toggleContainer",
            toggleText:"toggleText",
            toggle:"toggle",
            hideToggle:"hideToggle",
            showToggle:"showToggle",
            isShowing:"isShowing"
        }
        if(!toggleConfig.classNames){
            toggleConfig.classNames=defaults;
        }else{
            const newClassNames= Object.assign({},defaults,toggleConfig.classNames);
            toggleConfig.classNames=newClassNames;
        }
        
    }
    //#endregion

    //#region toggle js
    private defaultCreateToggleFn():string{
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
    private readToggle(){
        return fs.readFileSync(path.join(__dirname,"toggle/toggle.js"),"utf8");
    }
    private getToggleScript():HTMLScriptElement{
        const toggleConfig=this.options.toggleConfig!;
        
        const scriptElement=this.document!.createElement("script");
        scriptElement.type="text/javascript";
        
        let script=`
        (function(){
            var toggleConfig=${JSON.stringify(toggleConfig)};
            ${toggleConfig.createToggleFn}
            ${this.readToggle()}
            setUpToggle(toggleConfig);
        })()
        `
        if(this.minifiedOutput){
            const minifiedOutput=minify(script);
            if(minifiedOutput.error){
                throw minifiedOutput.error;
            }
            if(minifiedOutput.warnings){
                minifiedOutput.warnings.forEach(w=>console.log(w));
            }
            script=minifiedOutput.code;
        }
        scriptElement.innerHTML=script;
        return scriptElement;
    }
    private addToggleJs(){
        this.document!.body.appendChild(this.getToggleScript());
    }
    //#endregion
    //#region toggleCSS
    private getDefaultToggleCss(classNames:ClassNames):string{
        const svgSize="1em";
        return `.${classNames.toggle}{ stroke:#000;top:0.125em;position:relative;height:${svgSize};width:${svgSize} }
        .${classNames.toggleText}{ font-size:${svgSize}}
        `
    }
    
    private addToggleCss(classNames:ClassNames,customCss?:string){
        let css:string=customCss?customCss:this.getDefaultToggleCss(classNames);
        this.addPossiblyMinifiedCss(css);
    }
    //#endregion
    
    private addToggle(){
        if(this.options.toggleConfig){
            var toggleConfig:ToggleConfig=this.addToggleDefaults();
            this.addToggleJs();
            
            this.addToggleCss(toggleConfig.classNames!,toggleConfig.customCss);
        }
    }
    //#endregion
    
    //#region sh css
    private addCss(){
        this.addTheme();
        this.addAdditionalCss();
    }
    private getTheme(){
        let themeContents:string="";
        if(this.options.customTheme){
            themeContents=this.getPossiblyMinifiedCss(this.options.customTheme);
        }else{
            themeContents = this._assetLoader.getTheme(this.minifiedOutput, this.options.theme ? this.options.theme : "Default")
        }
        return themeContents;
    }
    private addTheme(){
        this.addCssToDocument(this.getTheme());
    }
    private addAdditionalCss(){
        const additionalCss=this.options.additionalCss;
        if(additionalCss){
            this.addPossiblyMinifiedCss(additionalCss);
        }
    }
    //#endregion
    private getPossiblyMinifiedCss(css:string){
        return this.minifiedOutput?processString(css):css;
    }
    private addPossiblyMinifiedCss(css:string){
        css=this.getPossiblyMinifiedCss(css);
        this.addCssToDocument(css);
    }
    private addCssToDocument(css:string){
        const style=this.document!.createElement("style");
        style.innerHTML=css;
        this.document!.head.appendChild(style);
    }
    //#region new contents
    private getDocTypeString(){
        var node = this.document!.doctype;
        let html="";
        if(node){
             html = "<!DOCTYPE "
            + node.name
            + (node.publicId ? ' PUBLIC "' + node.publicId + '"' : '')
            + (!node.publicId && node.systemId ? ' SYSTEM' : '') 
            + (node.systemId ? ' "' + node.systemId + '"' : '')
            + '>';
        }
        return html;
    }
    //default isPartial
    private isPartial=function(html:string,file:File){
        const firstTag=html.substring(html.indexOf("<"),html.indexOf(">")).toLowerCase();
        return !(firstTag.startsWith("<!doctype")||firstTag.startsWith("<html")||firstTag.startsWith("<head")||firstTag.startsWith("<body"));
    }
    private getNewContents(){
        if(this.isPartial(this.html,this.file!)){
            return this.document!.head.innerHTML+this.getBodyWithoutInjectedScripts(false);
        }else{
            return this.getDocTypeString()+this.getHtmlWithoutInjectedScripts();
        }
    }
    private getHtmlWithoutInjectedScripts(){
        const htmlEl=this.document!.documentElement;
        let html=htmlEl.outerHTML;
        const removableScripts=this.document!.getElementsByClassName(this.removableScriptClassName);
        for(let i=0;i<removableScripts.length;i++){
            html=html.replace(removableScripts[i].outerHTML,"");
        }
        return html;
    }
    private getBodyWithoutInjectedScripts(outerHTML:boolean){
        const body=this.document!.body;
        let html=outerHTML?body.outerHTML:body.innerHTML;
        const removableScripts=this.document!.getElementsByClassName(this.removableScriptClassName);
        for(let i=0;i<removableScripts.length;i++){
            html=html.replace(removableScripts[i].outerHTML,"");
        }
        return html;
    }
    
    //#endregion
    
}
