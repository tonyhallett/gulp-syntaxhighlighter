
import {JSDOM} from 'jsdom';
import {processString} from 'uglifycss'
import {minify} from 'uglify-js'
import * as fs from 'fs'
import * as path from 'path'

import { GulpTransformBase,File,GulpTransformBaseOptions,TransformCallback,PluginError } from "gulpTransformBase"

export function syntaxHighlighter(options?:SyntaxHighlighterOptions){
    const transformOptions=Object.assign(options,{supportsBuffer:true,supportsStream:false,pluginName:"gulp-syntaxhighlighter"});
    return new SyntaxHighlighterTransform(transformOptions);
}
interface ToggleConfigMessage{
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
interface ClassNames{
    toggleContainer?:string,
    toggleText?:string,
    toggle?:string,
    showToggle?:string,
    hideToggle?:string,
    isShowing?:string
}
interface ToggleConfig{
    toggleState?:"Show"|"Hide",
    message?:ToggleConfigMessage,
    svgCreateToggleFn?:string,
    classNames?:ClassNames,
    customCss?:string,
    
}
interface SyntaxHighlighterOptions{
    useMinifiedSyntaxHighlighter?:boolean
    minifiedOutput?:boolean
    theme?:string,
    customTheme?:string,
    additionalCss?:string,
    globalParams:{
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
interface SyntaxHighlighterTransformOptions extends GulpTransformBaseOptions, SyntaxHighlighterOptions{
    
}
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
class SyntaxHighlighterTransform extends GulpTransformBase<SyntaxHighlighterTransformOptions> {

    private SyntaxHighlighter:any;
    private useMinifiedSyntaxHighlighter=true;
    private document:Document|undefined
    private html:string=""
     //#region base - unimportant
     protected ignoreFile(file: File): boolean {
        return false;
    }
    protected filterFile(file: File): boolean {
        return false;
    }
    protected transformStreamFile(file: File, contents: NodeJS.ReadableStream, encoding: string, cb: TransformCallback): void {
        //will not be reached
    }
    //#endregion
   
    constructor(options:SyntaxHighlighterOptions){
        super(options);
        if(this.options.useMinifiedSyntaxHighlighter!==undefined){
            this.useMinifiedSyntaxHighlighter=this.options.useMinifiedSyntaxHighlighter;
        }
        this.loadSyntaxHighlighter();
    }
    //#region loading syntaxhighlighter
    private getBrushFiles(){
        return getFilesWithExtensionFromDir(path.resolve(__dirname,"syntaxHighlighter"),(f=>{
            return f.indexOf("shBrush")!==-1&&(this.useMinifiedSyntaxHighlighter?f.endsWith(".min.js"):!f.endsWith(".min.js"));
        }));
    }
    private loadSyntaxHighlighter(){
        
        const shCore=require("./syntaxHighlighter/shCore" + (this.useMinifiedSyntaxHighlighter?".min.js":".js"));
        this.SyntaxHighlighter=shCore.SyntaxHighlighter;
        if(this.options.config){
            this.SyntaxHighlighter.config={...this.SyntaxHighlighter.config,...this.options.config};
        }
            
        const globalAny=global as any;
        globalAny.SyntaxHighlighter=this.SyntaxHighlighter;
        globalAny.XRegExp=shCore.XRegExp;
        
        this.getBrushFiles().forEach(f=>require(f));
    }
    //#endregion
   
    private applySyntaxHighlighter(){
        (this.options.globalParams as any).toolbar=false;
        this.SyntaxHighlighter.highlight(this.options.globalParams);
        this.addCss();
    }
    
    private setUpDocument(html:string):boolean{
        //try around this ?????????????????????????????? - perhaps have an option throw on non html
        this.html=html;
        let dom:JSDOM;
        try{
            dom=new JSDOM(html)
        }catch(e){
            return false;
        }
        this.document=dom.window.document;
        (global as any).document=document;
        return true;
    }
    
    
    
    protected transformBufferFile(file: File, contents: Buffer, encoding: string, cb: TransformCallback): void {
        
        const isHtml=this.setUpDocument(contents.toString("utf8"));
        if(isHtml){
            this.applySyntaxHighlighter();
                
            this.addToggle();
        
            file.contents=new Buffer(this.getNewContents());
        }

        
        cb(null,file);

    }
    //#region toggle
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

    //#region toggle js
    private defaultSvgCreateToggleFn():string{
        return `
        function createSvg(show){//much easier through path
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
        var toggleConfig=this.options.toggleConfig as ToggleConfig;
        this.addDefaultsToMessageConfig(toggleConfig);
        const classNames=this.addDefaultClassNames(toggleConfig);
        const scriptElement=this.document!.createElement("script");
        scriptElement.type="text/javascript";
        
        let script=`
        (function(){
            var toggleConfig=${JSON.stringify(toggleConfig)};
            ${toggleConfig.svgCreateToggleFn?toggleConfig.svgCreateToggleFn:this.defaultSvgCreateToggleFn()}
            ${this.readToggle()}
            setUpToggle(toggleConfig);
        })()
        `
        if(this.options.minifiedOutput){
            const minifiedOutput=minify(script);
            if(minifiedOutput.error){
                console.log("MINIFIED ERROR");
                //will do pluginerror
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
        return `.toggle{ stroke:#000;top:0.125em;position:relative;height:${svgSize};width:${svgSize} }
        .toggleText{ font-size:${svgSize}}
        .toggleContainer{}
        `
    }
    
    private addToggleCss(classNames:ClassNames,customCss?:string){
        let css:string=customCss?customCss:this.getDefaultToggleCss(classNames);
        if(this.options.minifiedOutput){
            css=processString(css);
        }
        this.addCssToDocument(css);
    }
    //#endregion
    private addToggle(){
        if(this.options.toggleConfig){
            this.addToggleJs();
            
            this.addToggleCss(this.options.toggleConfig.classNames as ClassNames,this.options.toggleConfig.customCss);
        }
    }
    //#endregion
    
    //#region sh css
    private addCss(){
        this.addAdditionalCss();
        this.addTheme();
    }
    private getTheme(){
        let themeContents:string="";
        if(this.options.customTheme){
            themeContents=this.options.customTheme;
        }else{
            const themePrefix="./syntaxHighlighter/shCore";
            const theme=this.options.theme?this.options.theme:"Default";
            const themePath=themePrefix+theme+(this.options.minifiedOutput?".min":"") +".css";
            themeContents=fs.readFileSync(themePath,"utf8");
        }
        return themeContents;
    }
    private addTheme(){
        this.addCssToDocument(this.getTheme());
    }
    private addAdditionalCss(){
        const additionalCss=this.options.additionalCss;
        if(additionalCss){
            const css=this.options.minifiedOutput?processString(additionalCss):additionalCss;
            this.addCssToDocument(css);
        }
    }
    //#endregion
    private addCssToDocument(css:string){
        const style=this.document!.createElement("style");
        style.innerHTML=css;
        this.document!.head.appendChild(style);
    }
    //#region new contents
    private isPartial(){
        return !this.html.startsWith("<html");//doc type?
    }
    private getNewContents(){
        if(this.isPartial()){
            return this.document!.head.innerHTML+document.body.innerHTML;
        }else{
            return (this.document!.firstChild as Element).outerHTML;
        }
    }
    //#endregion
    
}