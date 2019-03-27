import * as gulp from 'gulp'
import {destination} from './dest'
export function assetsToDist(){
    console.log("In assetsToDist")
    return gulp.src('../syntaxHighlighter/*').pipe(gulp.dest(destination));
}