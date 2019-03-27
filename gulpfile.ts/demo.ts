import * as gulp from 'gulp'
import {GulpSyntaxHighlighterOptions} from '../gulp-syntaxhighlighter/src/publicInterfaces'

function createExampleBuild(example:string,options:GulpSyntaxHighlighterOptions){
    const task=()=>{
        var syntaxHighlighter=require('../dist/gulp-syntaxhighlighter').syntaxHighlighter;
        return gulp.src(`../demo/src/${example}.html`).pipe(syntaxHighlighter(options)).pipe(gulp.dest("../demo/dest"));
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
        customCss:".t_toggle{ stroke:orange;top:0.125em;position:relative;height:1em;width:1em }" +
        ".t_toggleText{ font-size:1em}" + 
        ".t_toggleContainer{ border-style: solid;border-width:2;border-color:red}",
        classNames:{
            hideToggle:"t_hideToggle",
            toggleText:"t_toggleText",
            isShowing:"t_isShowing",
            showToggle:"t_showToggle",
            toggle:"t_toggle",
            toggleContainer:"t_toggleContainer"
        }
        
    }

})
export const buildDemo= gulp.parallel(buildExample1,buildExample2);