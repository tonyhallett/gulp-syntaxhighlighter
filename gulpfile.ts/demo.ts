import {src,dest,series,parallel} from 'gulp'
import {GulpSyntaxHighlighterOptions} from '../gulp-syntaxhighlighter/src/publicInterfaces'
import * as fs from 'fs-extra';
import * as path from 'path';
import {syntaxHighlighter} from '../dist/gulp-syntaxHighlighter/gulp-syntaxhighlighter'

function createExampleBuild(example:string,options:GulpSyntaxHighlighterOptions){
    const task=()=>{
        return src(`demo/src/${example}.html`).pipe(syntaxHighlighter(options)).pipe(dest("demo/dest"));
    }
    task.displayName="build" + example; 
    return task;
}
const buildExample1=createExampleBuild("example1",{
    useMinifiedSyntaxHighlighter:false,
    minifiedOutput:false,
    toggleConfig:{
        toggleState:"Show",
        messages:{
            
            message:"Message",
            when:"Always",
            placement:"Right"
        },
        createToggleFn:`
        function createToggleElement(){ 
            function createToggleHideShow(show){ 
                var img= document.createElement('img');
                img.src=show?'https://www.shareicon.net/data/32x32/2016/06/30/789009_multimedia_512x512.png':'https://www.shareicon.net/data/32x32/2016/06/30/789031_multimedia_512x512.png';
                return img;
            }
            return {
                showToggle:createToggleHideShow(true),
                hideToggle:createToggleHideShow(false)
            }
        }`
    }
});
const buildExample2=createExampleBuild("example2",{
    globalParams:{
        highlight:[1],
        gutter:false
    },
    config:{
        tagName:"mine"
    },
    additionalCss:".syntaxhighlighter{width:600 !important}",
    theme:"Midnight",
    isPartialFn:function(){
        return false;
    },
    toggleConfig:{
        toggleState:"Show",
        messages:{
            message:"Message",
            when:"Always",
            placement:"Below"
        },
        customCss:".t_toggle{ stroke:orange;top:0.125em;position:relative;height:4em;width:4em }" +
        ".t_toggleText{ font-size:2em}" + 
        ".t_toggleContainer{ border-style: solid;border-width:1}" + 
        ".t_isShowing{ border-style: solid;border-color:green}" + 
        ".t_isHidden{ border-style: dotted;border-width:3;border-color:red}" + 
        ".t_hideToggle>rect{fill:yellow}" +
        ".t_showToggle>circle{fill:red}" +
        ".t_isHidden t_toggleText{ font-style:italic}",
        classNames:{
            hideToggle:"t_hideToggle",
            toggleText:"t_toggleText",
            toggleContainerShown:"t_isShowing",
            toggleContainerHidden:"t_isHidden",
            showToggle:"t_showToggle",
            toggle:"t_toggle",
            toggleContainer:"t_toggleContainer"
        }
        
    }

})
const defaultOptionsExample=createExampleBuild("defaultOptionsExample",{toggleConfig:{}});
const singleToggleExample=createExampleBuild("singleToggle",{minifiedOutput:false, toggleConfig:{
    createToggleFn:`
    function createToggleElement(){
        function createToggle(){
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
            circle.setAttributeNS(null,"cx",16);

            svg.append(rect);
            svg.append(circle);
            
            return svg;
        }
        return {
            delay:1000,
            toggleElement:createToggle(),
        }
    }
    `,
    customCss:`
    .toggle{ top:0.125em;position:relative;height:2em;width:2em}

    .toggleContainerInitial.toggleContainerShown .toggle{stroke:green}
    .toggleContainerInitial.toggleContainerHidden .toggle{stroke:red}
    .toggleContainerToggled.toggleContainerShown .toggle
    {
        
        stroke:green;
        transition:stroke 1s

    }
    .toggleContainerToggled.toggleContainerHidden .toggle
    {
        
        stroke:red;
        transition:stroke 1s
    }


    .toggleText{ padding:10px; font-size:2em;user-select:none}
        
    .toggleContainerInitial.toggleContainerShown circle{cx:8;fill:green}
    .toggleContainerInitial.toggleContainerHidden circle{cx:16;fill:red}
    .toggleContainerToggled.toggleContainerShown circle
    {
        cx:8;
        fill:green;
        transition:cx 1s, fill 1s;
    }
    .toggleContainerToggled.toggleContainerHidden circle
    {
        cx:16;
        fill:red;
        transition:cx 1s,fill 1s
    }
    `,
}});

function cleanDest(){
    return fs.emptyDir(path.join(process.cwd(),"demo/dest"));
}

export const buildDemo= series(cleanDest,parallel(defaultOptionsExample,buildExample1,buildExample2,singleToggleExample));