import * as gulp from 'gulp'
import {gshTsCompile,toggleCompile} from './compile'
import {assetsToDist} from './assets'
export function watchToggle(done){
    gulp.watch("../toggle/src/*.ts",toggleCompile);
    done();
}

export function watchGulpSyntaxHighlighter(done){
    //https://github.com/ivogabe/gulp-typescript/issues/191
    gulp.watch("../syntaxHighlighter/*",gshTsCompile);
    done();
}
export function watchAssets(done){
    gulp.watch("../gulp-syntaxhighlighter/src/*.ts",assetsToDist);
    done();
}
export function watchAll(){
    return gulp.parallel(watchAssets,watchGulpSyntaxHighlighter,watchToggle)
}