import * as gulp from 'gulp'
import {destination} from './dest'
import {consoleLogger} from './gulpHelpers'
export function assetsToDist(){
    return gulp.src('./syntaxHighlighter/*').pipe(gulp.dest(destination));
}