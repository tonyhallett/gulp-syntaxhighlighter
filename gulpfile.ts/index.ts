import * as gulp from 'gulp'
import {jestTests} from './jesttests'
import {compile,gshTsCompile,toggleCompile} from './compile'
import {assetsToDist} from './assets'
import {buildDemo} from './demo'

export {
    jestTests,
    assetsToDist,
    compile,gshTsCompile,toggleCompile,
    buildDemo
}

export const compileWithAssets=gulp.parallel(assetsToDist,compile);

export const build=gulp.series(jestTests,compileWithAssets,buildDemo);
