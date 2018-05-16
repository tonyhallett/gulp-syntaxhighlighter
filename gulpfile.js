var gulp=require('gulp');
var exec = require('child_process').exec;
var syntaxHighlighter=require("./gulp-syntaxhighlighter").syntaxHighlighter;

function tsc(cb){
    exec('tsc', function (err, stdout, stderr) {
        cb(err);
    });
}
function tscToggle(cb){
    exec('tsc -p toggle', function (err, stdout, stderr) {
        cb(err);
    });
}
exports.tsc=tsc;
exports.tscToggle=tscToggle;
exports.default=gulp.parallel(tsc,tscToggle);

function buildExample1(){
    return gulp.src("demo/src/example1.html").pipe(syntaxHighlighter(
        {
            toggleConfig:{
                toggleState:"Show",
                message:{
                    
                    message:"Message",
                    when:"Always",
                    placement:"Right"
                },
                createToggleFn:"function createToggleElement(show){ " + 
                "var img= document.createElement('img');" +
                "img.src=show?'https://www.shareicon.net/data/32x32/2016/06/30/789009_multimedia_512x512.png':'https://www.shareicon.net/data/32x32/2016/06/30/789031_multimedia_512x512.png';" +
                "return img;}"
            }
        })).pipe(gulp.dest("demo/dest"));
}
function buildExample2(){
    return gulp.src("demo/src/example2.html").pipe(syntaxHighlighter(
        {
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
                message:{
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

        })).pipe(gulp.dest("demo/dest"));
}
exports.demo=gulp.parallel(buildExample1,buildExample2);
