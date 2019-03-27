import * as gulp from 'gulp'
import {GulpSyntaxHighlighterOptions} from '../gulp-syntaxhighlighter/src/publicInterfaces'
import * as fs from 'fs-extra';
import * as path from 'path';

function createExampleBuild(example:string,options:GulpSyntaxHighlighterOptions){
    const task=()=>{
        var syntaxHighlighter=require('../dist/gulp-syntaxhighlighter').syntaxHighlighter;
        return gulp.src(`demo/src/${example}.html`).pipe(syntaxHighlighter(options)).pipe(gulp.dest("demo/dest"));
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
        createToggleFn:"function createToggleElement(show){ " + 
        "var img= document.createElement('img');" +
        "img.src=show?'https://www.shareicon.net/data/32x32/2016/06/30/789009_multimedia_512x512.png':'https://www.shareicon.net/data/32x32/2016/06/30/789031_multimedia_512x512.png';" +
        "return img;}"
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

function cleanDest(){
    return fs.emptyDir(path.join(process.cwd(),"demo/dest"));
}

export const buildDemo= gulp.series(cleanDest,gulp.parallel(defaultOptionsExample,buildExample1,buildExample2));