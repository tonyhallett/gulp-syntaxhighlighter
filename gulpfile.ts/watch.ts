import * as gulp from 'gulp'
import {gshTsCompile,toggleCompile} from './compile'
import {assetsToDist} from './assets'
type Done=()=>void;
export function watchToggle(done:Done){
    gulp.watch("./toggle/src/toggleExport/*.ts",{ignoreInitial:false},toggleCompile);
    done();
}

export function watchGulpSyntaxHighlighter(done:Done){
    //https://github.com/ivogabe/gulp-typescript/issues/191
    gulp.watch("./gulp-syntaxhighlighter/src/*.ts",{ignoreInitial:false},gshTsCompile);
    done();
}
export function watchAssets(done:Done){
    
    gulp.watch("./syntaxHighlighter/*",{ignoreInitial:false},assetsToDist);
    done();
}

export const watchAll = gulp.parallel(watchAssets,watchGulpSyntaxHighlighter,watchToggle);